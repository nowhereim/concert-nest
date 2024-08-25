import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// 메트릭 정의
const latency = new Trend('http_req_duration', true);
const successRate = new Rate('http_req_success');
const requestCount = new Counter('http_req_count');

export const options = {
  scenarios: {
    constant_request_rate: {
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
    'http_req_duration{name:AvailableDates}': ['p(95)<600'],
    'http_req_duration{name:AvailableSeats}': ['p(95)<600'],
    'http_req_duration{name:Reservation}': ['p(95)<600'],
    'http_req_duration{name:ReservationStatus}': ['p(95)<600'],
    'http_req_duration{name:UserCash}': ['p(95)<600'],
    'http_req_duration{name:CashRecharge}': ['p(95)<600'],
    'http_req_duration{name:Payment}': ['p(95)<600'],
  },
  http: {
    timeout: '3s', // 타임아웃 설정
  },
};

export default function () {
  sleep(1);
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

  if (tokenStatus !== 'IN_PROGRESS') {
    return;
  }

  // 3. 콘서트 예약 가능한 날짜 조회
  let availableDatesRes = http.get(
    `http://localhost:8080/concert/available-dates?concertId=1`,
    {
      headers: { 'queue-token': tokenId },
      tags: { name: 'AvailableDates' },
    },
  );

  if (availableDatesRes.status !== 200) {
    return;
  }

  check(availableDatesRes, {
    'Available dates check was 200': (r) => r.status === 200,
  });
  latency.add(availableDatesRes.timings.duration, { name: 'AvailableDates' });
  successRate.add(availableDatesRes.status === 200, { name: 'AvailableDates' });
  requestCount.add(1, { name: 'AvailableDates' });
  const availableDates = JSON.parse(availableDatesRes.body);
  if (availableDates.length === 0) {
    return;
  }

  const concertScheduleId = availableDates[0].id; // 첫 번째 날짜의 id를 사용

  // 4. 예약 가능한 좌석 조회 및 좌석 예약 시도
  while (true) {
    let availableSeatsRes = http.get(
      `http://localhost:8080/concert/available-seats?concertScheduleId=${concertScheduleId}`,
      {
        headers: { 'queue-token': tokenId },
        tags: { name: 'AvailableSeats' },
      },
    );
    if (availableSeatsRes.status !== 200) {
      return;
    }
    latency.add(availableSeatsRes.timings.duration, { name: 'AvailableSeats' });
    successRate.add(availableSeatsRes.status === 200, {
      name: 'AvailableSeats',
    });
    requestCount.add(1, { name: 'AvailableSeats' });
    const availableSeats = JSON.parse(availableSeatsRes.body);
    const activeSeats = availableSeats.filter((seat) => seat.isActive);

    if (activeSeats.length === 0) {
      return; // 예약 가능한 좌석이 없으므로 다시 시도
    }

    const randomIndex = Math.floor(Math.random() * activeSeats.length);
    const activeSeat = activeSeats[randomIndex];

    // 5. 좌석 예약 요청
    let reservationRes = http.post(
      `http://localhost:8080/reservation`,
      JSON.stringify({
        userId: userId,
        seatId: activeSeat.id,
        concertId: 1,
      }),
      {
        headers: { 'Content-Type': 'application/json', 'queue-token': tokenId },
        tags: { name: 'Reservation' },
      },
    );

    if (reservationRes.status === 403) {
      continue; // 다시 시도
    }

    if (reservationRes.status !== 201) {
      return;
    }
    latency.add(reservationRes.timings.duration, { name: 'Reservation' });
    successRate.add(reservationRes.status === 201, { name: 'Reservation' });
    requestCount.add(1, { name: 'Reservation' });
    // 6. 좌석 예약 상태 확인
    while (true) {
      sleep(1);
      let reservationStatusRes = http.get(
        `http://localhost:8080/reservation?userId=${userId}`,
        {
          headers: { 'queue-token': tokenId },
          tags: { name: 'ReservationStatus' },
        },
      );

      if (reservationStatusRes.status !== 200) {
        return;
      }
      latency.add(reservationStatusRes.timings.duration, {
        name: 'ReservationStatus',
      });
      successRate.add(reservationStatusRes.status === 200, {
        name: 'ReservationStatus',
      });
      requestCount.add(1, { name: 'ReservationStatus' });

      const reservationBodyStatus = JSON.parse(
        reservationStatusRes.body,
      ).status;

      if (reservationBodyStatus === 'PENDING') {
        continue;
      }
      if (reservationBodyStatus === 'SEAT_OCCUPIED') {
        // 7. 유저 포인트 조회
        let userCashRes = http.get(
          `http://localhost:8080/user/cash?userId=${userId}`,
          {
            tags: { name: 'UserCash' },
          },
        );

        check(userCashRes, {
          'User cash check was 200': (r) => r.status === 200,
        });
        latency.add(userCashRes.timings.duration, { name: 'UserCash' });
        successRate.add(userCashRes.status === 200, { name: 'UserCash' });
        requestCount.add(1, { name: 'UserCash' });

        // 8. 유저 포인트 충전
        let rechargeRes = http.post(
          `http://localhost:8080/user/cash`,
          JSON.stringify({ userId: userId, amount: 10000 }), // 10,000원 충전
          {
            headers: { 'Content-Type': 'application/json' },
            tags: { name: 'CashRecharge' },
          },
        );

        check(rechargeRes, {
          'Cash recharge status was 201': (r) => r.status === 201,
        });
        latency.add(rechargeRes.timings.duration, { name: 'CashRecharge' });
        successRate.add(rechargeRes.status === 201, { name: 'CashRecharge' });
        requestCount.add(1, { name: 'CashRecharge' });
        // 9. 결제 요청
        let paymentRes = http.post(
          `http://localhost:8080/payment`,
          JSON.stringify({ userId: userId, seatId: activeSeat.id }),
          {
            headers: {
              'Content-Type': 'application/json',
              'queue-token': tokenId,
            },
            tags: { name: 'Payment' },
          },
        );

        check(paymentRes, {
          'Payment status was 201': (r) => r.status === 201,
        });
        latency.add(paymentRes.timings.duration, { name: 'Payment' });
        successRate.add(paymentRes.status === 201, { name: 'Payment' });
        requestCount.add(1, { name: 'Payment' });
        return; // 모든 작업이 성공적으로 완료되면 종료
      }

      if (reservationBodyStatus === 'FAIL') {
        break; // 예약 실패 시 예약 가능 좌석 조회로 돌아감
      }
      sleep(1); // 1초 간격으로 상태 확인
    }
    sleep(1);
  }
}
