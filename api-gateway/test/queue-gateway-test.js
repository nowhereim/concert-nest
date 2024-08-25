import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// 메트릭 정의
const latency = new Trend('http_req_duration', true);
const successRate = new Rate('http_req_success');
const requestCount = new Counter('http_req_count');

export const options = {
  scenarios: {
    token_test: {
      executor: 'constant-arrival-rate',
      rate: 100, // 총 TPS (초당 요청 수)
      timeUnit: '1s', // 요청 단위 시간
      duration: '2m', // 테스트 지속 시간
      preAllocatedVUs: 0, // 사전 할당된 가상 사용자 수
      maxVUs: 3600000, // 최대 가상 사용자 수
    },
  },
  thresholds: {
    'http_req_duration{name:TokenIssuance}': ['p(95)<6000'],
    'http_req_duration{name:TokenStatus}': ['p(95)<600'],
  },
  http: {
    timeout: '3s', // 타임아웃 설정
  },
};

export default function () {
  const userId = (__VU - 1) * 60 + __ITER + 1;

  // 1. 토큰 발급
  let tokenIssueRes = http.post(
    `http://localhost:8080/queue`,
    JSON.stringify({ userId: userId }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'TokenIssuance' },
    },
  );

  check(tokenIssueRes, {
    'Token issuance status was 201': (r) => r.status === 201,
  });
  latency.add(tokenIssueRes.timings.duration, { name: 'TokenIssuance' });
  successRate.add(tokenIssueRes.status === 201, { name: 'TokenIssuance' });
  requestCount.add(1, { name: 'TokenIssuance' });

  if (tokenIssueRes.status !== 201) {
    return;
  }

  const responseBody = JSON.parse(tokenIssueRes.body);
  const tokenId = responseBody.id;

  // 2. 최대 3분 동안 토큰 상태 확인
  let tokenStatus = null;

  let attempts = 0;
  while (attempts < 180) {
    // 180초 = 3분
    let tokenStatusRes = http.get(
      `http://localhost:8080/queue?queueId=${tokenId}`,
      {
        tags: { name: 'TokenStatus' },
      },
    );

    check(tokenStatusRes, {
      'Token status check was 200': (r) => r.status === 200,
    });
    latency.add(tokenStatusRes.timings.duration, { name: 'TokenStatus' });
    successRate.add(tokenStatusRes.status === 200, { name: 'TokenStatus' });
    requestCount.add(1, { name: 'TokenStatus' });

    tokenStatus = JSON.parse(tokenStatusRes.body).status;
    if (tokenStatus === 'IN_PROGRESS') {
      break;
    }

    attempts++;
    sleep(1); // 1초 간격으로 상태 확인
  }
}
