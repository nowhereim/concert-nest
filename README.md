### [`mock api commit link`](https://github.com/nowhereim/concert-nest/commit/16ad9a74406d2e6387a7eb3761515fe369336c73)
PR이 아닌 저장소 제출로 피드백은 위 링크 커밋 코멘트 주시면 감사하겠습니다.
<br>
`e.g : ERD 실화에요? 불합격.`

# 콘서트 예약 서비스

<aside>
💡 분산 환경에서도 대기열처리가 가능한 서버를 구현합니다.

## Description

- **`콘서트 예약 서비스`** 를 구현합니다.
- 대기열 시스템을 구축하여, 예약 서비스는 작업 가능한 유저만 수행할 수 있도록 합니다.
- 사용자는 좌석 예약 시에 미리 충전한 잔액을 이용합니다.
- 좌석 예약 요청 시 결제가 이루어지지 않더라도 일정 시간 동안 다른 유저가 해당 좌석에 접근할 수 없도록 합니다.

## Requirements

- 아래 5가지 API를 구현합니다.
    - 유저 토큰 발급 API
    - 예약 가능 날짜 / 좌석 API
    - 좌석 예약 요청 API
    - 잔액 충전 / 조회 API
    - 결제 API
- 각 기능 및 제약사항에 대해 단위 테스트를 반드시 하나 이상 작성합니다.
- 다수의 인스턴스로 애플리케이션이 동작하더라도 기능에 문제가 없도록 작성합니다.
- 동시성 이슈를 고려하여 구현합니다.
- 대기열 개념을 고려하여 구현합니다.

## API Specs

1️⃣ **`주요` 유저 대기열 토큰 기능**

- 서비스를 이용할 토큰을 발급받는 API를 작성합니다.
- 토큰은 유저의 UUID와 해당 유저의 대기열을 관리할 수 있는 정보(대기 순서 또는 잔여 시간 등)를 포함합니다.
- 이후 모든 API는 이 토큰을 이용해 대기열 검증을 통과해야 이용 가능합니다. 
- `먼저 DB로 토큰을 구현` 하고 점진적으로 다른 스택으로 리팩토링을 합니다.

> 기본적으로 폴링으로 본인의 대기열을 확인한다고 가정하며, 다른 방안 또한 고려해보고 구현할 수 있습니다.

2️⃣ **`기본` 예약 가능 날짜 / 좌석 API**

- 예약 가능한 날짜와 해당 날짜의 좌석을 조회하는 API를 각각 작성합니다.
- 예약 가능한 날짜 목록을 조회할 수 있습니다.
- 날짜 정보를 입력받아 예약 가능한 좌석 정보를 조회할 수 있습니다.

> 좌석 정보는 1~50까지의 좌석번호로 관리됩니다.

3️⃣ **`주요` 좌석 예약 요청 API**

- 날짜와 좌석 정보를 입력받아 좌석을 예약 처리하는 API를 작성합니다.
- 좌석 예약과 동시에 해당 좌석은 그 유저에게 약 (예: 5분)간 임시 배정됩니다. (시간은 정책에 따라 자율적으로 정의합니다.)
- 배정 시간 내에 결제가 완료되지 않으면 좌석에 대한 임시 배정이 해제되어야 하며, 임시 배정된 상태라면 다른 사용자는 예약할 수 없어야 합니다.

4️⃣ **`기본` 잔액 충전 / 조회 API**

- 결제에 사용될 금액을 API를 통해 충전하는 API를 작성합니다.
- 사용자 식별자 및 충전할 금액을 받아 잔액을 충전합니다.
- 사용자 식별자를 통해 해당 사용자의 잔액을 조회합니다.

5️⃣ **`주요` 결제 API**

- 결제 처리하고 결제 내역을 생성하는 API를 작성합니다.
- 결제가 완료되면 해당 좌석의 소유권을 유저에게 배정하고 대기열 토큰을 만료시킵니다.

6️⃣ **`대기열` 고도화**

- 다양한 전략을 통해 합리적으로 대기열을 제공할 방법을 고안합니다.
- e.g: 특정 시간 동안 N명에게만 권한을 부여한다.
- e.g: 한번에 활성화된 최대 유저를 N으로 유지한다.

</aside>

## Milstone

<details>
<summary>📅 Milstone</summary>



```mermaid
    gantt
    title 콘서트 예약 서비스 개발 마일스톤 ( TDD 기반 )
    tickInterval 1day
    dateFormat YYYY-MM-DD
    axisFormat %Y-%m-%d
    todayMarker off
    excludes Sun
    
    section 1주차: 계획 및 설계
    요구사항 분석                      :des1, 2024-07-01, 1d
    시퀀스 다이어그램 작성             :des2, 2024-07-02, 0.5d
    ERD 작성                           :des3, 2024-07-02, 0.5d
    Mock API 생성                      :des4, 2024-07-03, 0.5d
    테스트 코드 작성                   :des5, 2024-07-03, 0.5d
    README 작성                        :des6, 2024-07-04, 0.5d
    과제 제출                          :des7, 2024-07-04, 0.5d
    도메인 모델링                      :des8, 2024-07-05, 1d
    네트워킹                           :net1, 2024-07-06, 1d
    
    section 2주차: 기능 개발
    토큰 발급 API 개발 (TDD)                 :dev1, 2024-07-08, 0.5d
    대기열 조회 API 개발 (TDD)               :dev2, 2024-07-08, 0.5d
    통합 테스트 작성               :dev2, 2024-07-08, 0.5d
    예약 가능 날짜 조회 API 개발 (TDD)        :dev3, 2024-07-09, 0.5d
    예약 가능 좌석 조회 API 개발 (TDD)        :dev4, 2024-07-09, 0.5d
    좌석 예약 API 개발 (TDD)                :dev5, 2024-07-09, 0.5d
    통합 테스트 작성               :dev2, 2024-07-09, 0.5d
    잔액 충전 API 개발 (TDD)                :dev6, 2024-07-10, 0.5d
    잔액 조회 API 개발 (TDD)                :dev7, 2024-07-10, 0.5d
    통합 테스트 작성               :dev2, 2024-07-10, 0.5d
    결제 API 개발 (TDD)                     :dev8, 2024-07-11, 0.5d
    통합 테스트 작성               :dev2, 2024-07-11, 0.5d
    과제 제출                           :dev9, 2024-07-11, 0.5d
    회고 및 리팩토링을 위한 분석            :dev9, 2024-07-12, 0.5d
    네트워킹                           :net2, 2024-07-13, 1d
    
    section 3주차: 리팩토링 및 고도화
    코드 리팩토링 시작                  :ref1, 2024-07-15, 1d
    발제 내용 리팩토링                     :ref2, 2024-07-16, 1d
    발제 내용 리팩토링                      :ref3, 2024-07-17, 1d
    발제 내용 리팩토링                    :ref4, 2024-07-18, 0.5d
    발제 내용 리팩토링                    :ref5, 2024-07-18, 0.5d
    과제 제출                  :ref6, 2024-07-19, 1d
    네트워킹                           :net3, 2024-07-20, 1d
```
</details>

## Sequence
<details>
<summary>💡 Sequence Diagrams</summary>

</Br>

<details>
<summary> 토큰 발급 API (POST)</summary>

### 토큰 발급 API (POST)
> 대기열 토큰 발급
```mermaid
sequenceDiagram
autonumber
actor User
    User->>대기열: 대기열 토큰 요청
    break 발급 불가(이미 존재)
    대기열-->>User: 발급 불가
    end
    대기열-->>User: 토큰 반환
```
</details>

<details>
<summary> 대기열 상태 확인 API (GET)</summary>

### 대기열 상태 확인 API (GET)
> 대기열 상태 확인
```mermaid
sequenceDiagram
autonumber
actor User
    loop 폴링
        User->>대기열: 대기열 상태 확인
        %% 대기열->>토큰:토큰 검증
        break 대기열 검증 실패
        대기열-->>User: 대기열 검증 실패
        end
        %% 대기열->>대기열: 상태 확인
        %% 대기열-->>대기열: 상태 반환
        대기열-->>User: 대기열 상태 응답
        
    end
```
</details>

<details>
<summary> 예약 가능 날짜 조회 API (GET)</summary>

### 예약 가능 날짜 조회 API (GET)
> 예약 가능 좌석 조회
```mermaid
sequenceDiagram
autonumber
actor User
    User->>대기열: 대기열 검증
    break 대기열 검증 실패
    대기열-->>User: 대기열 검증 실패
    end
    대기열->>콘서트스케쥴: 예약 가능 날짜 요청
    콘서트스케쥴-->>User: 예약 가능 날짜 제공
```
</details>

<details>
<summary> 예약 가능 좌석 조회 API (GET)</summary>

### 예약 가능 좌석 조회 API (GET)
> 예약 가능 좌석 조회
```mermaid
sequenceDiagram
autonumber
actor User
    User->>대기열: 대기열 검증
        break 대기열 검증 실패
        대기열-->>User: 대기열 검증 실패
        end
    대기열->>좌석: 예약 가능 좌석 요청
    좌석-->>User: 예약 가능 좌석 제공
```
</details>

<details>
<summary> 잔액 충전 API (POST)</summary>

### 잔액 충전 API (POST)
> 예약 가능 좌석 조회 요청
```mermaid
sequenceDiagram
autonumber
actor User
    User->>캐시: 캐시 충전 요청
    캐시-->>User: 캐시 충전 성공
```
</details>

<details>
<summary> 잔액 조회 API (GET)</summary>

### 잔액 조회 API (GET)
> 예약 가능 좌석 조회
```mermaid
sequenceDiagram
autonumber
actor User
    User->>캐시: 캐시 잔액 조회
    캐시-->>User: 캐시 잔액
```
</details>

<details>
<summary> 좌석 예약 API (POST)</summary>

### 좌석 예약 API (POST)
> 좌석 예약 요청
```mermaid
sequenceDiagram
autonumber
actor User
    User->>대기열: 대기열 검증
        break 대기열 검증 실패
        대기열-->>User: 대기열 검증 실패
        end
    대기열->>좌석: 좌석 활성 상태 변경
    좌석->>좌석 예약: 좌석 예약 정보 생성
    좌석 예약-->>좌석: 예약 성공
    좌석-->>User: 예약 성공
```
</details>

<details>
<summary> 결제 API (POST)</summary>

### 결제 API (POST)
> 결제
```mermaid
sequenceDiagram
    autonumber
    actor User

    User->>결제: 결제 요청
    결제->>좌석 예약: 좌석 점유 검증
    break 검증 실패
        좌석 예약-->>결제: 검증 실패
        결제-->>User: 검증 실패
    end
    좌석 예약-->>결제: 예약 정보 반환
    결제->>캐시: 캐시 잔액 확인
    캐시-->>결제: 잔액 정보

    alt 잔액 부족
    결제-->>User: 잔액 부족

    %% User->>결제: 캐시 충전 요청
    %% 결제->>캐시: 캐시 충전 처리
    %% 캐시-->>결제: 충전 완료
    %% 결제-->>User: 캐시 충전 확인
        
    else 잔액 충분
        결제->>캐시: 캐시 차감
        캐시-->>결제: 캐시 차감 완료
        결제->>결제: 결제 내역 생성
        결제->>좌석 예약: 좌석 예약 상태 변경
        좌석 예약->>대기열: 대기열 토큰 만료
        좌석 예약-->>결제: 예약 완료
        결제-->>User: 예약 완료
    end
```
</details>

<details>
<summary> BACKGROUND-A</summary>

### BACKGROUND-A
> 대기열 만료 처리
```mermaid
sequenceDiagram
    autonumber
    loop
    백그라운드->>대기열: 활성 상태 레코드 만료 감시 및 처리
    end
```
</details>

<details>
<summary> BACKGROUND-B</summary>

### BACKGROUND-B
> 좌석 예약 만료 처리
```mermaid
sequenceDiagram
    autonumber
    loop
    백그라운드->>좌석 예약: 좌석 예약 시간 만료 감시 및 처리
    end
```
</details>

</details>



## ERD

<details>
<summary>🗂️ ERD</summary>



```mermaid
erDiagram
    %% 사용자 테이블
    USER {
        bigint ID
        string name
        date created_at
        date updated_at
        date deleted_at
        
    }


    %% 포인트 관련 테이블
    CASH {
        bigint ID PK
        bigint userID
        bigint balance
        date created_at
        date updated_at
        date deleted_at
    }

    CASH_HISTORY {
        bigint ID PK
        bigint userID
        bigint amount
        string description
        date created_at
    }

        WAITING_QUEUE {
        bigint ID PK
        bigint userID UK
        string status "ENUM"
        date created_at
        date expired_at "활성 상태 변경시 생성"
    }

    %% 콘서트 관련 테이블
    CONCERT {
        bigint ID PK
        string name
        date created_at
        date updated_at
        date deleted_at
    }

    CONCERT_SCHEDULE {
        bigint ID PK 
        bigint concertID FK
        int totalSeats
        int reservedSeats
        date open_at
        date close_at
        date booking_start_at
        date booking_end_at
        date created_at
        date updated_at
        date deleted_at
    }

    %% 좌석 관련 테이블
    SEAT {
        bigint ID PK
        bigint concert_scheduleID FK
        string seatNumber
        bool isActive
        int price
        date created_at
        date updated_at
        date deleted_at
    }

    SEAT_RESERVATION {
        bigint ID PK
        bigint seatID
        bigint userID
        string status "ENUM"
        date created_at
        date updated_at
        date deleted_at
    }

    PAYMENT {
        bigint ID PK
        bigint userID
        string seatNumber
        string concertName
        date openDate
        date closeDate
        bigint totalAmount
        string status "ENUM"
        date created_at
        date updated_at
        date deleted_at
    }

        %% 관계 정의 (간접 참조)
    %%USER ||..o{ PAYMENT : ""


    %%USER ||..o{ WAITING_QUEUE : ""


    CONCERT ||--o{ CONCERT_SCHEDULE : ""


    CONCERT_SCHEDULE ||--o{ SEAT : ""


    %%SEAT ||..o{ SEAT_RESERVATION : ""


    %%USER ||..o{ SEAT_RESERVATION : ""

```
</details>


<!-- ## API

<details>
<summary>🔍 API Documentation</summary>

### API 명세서

#### 1. 유저 토큰 발급

- **경로**: `POST /queue/issue`
- **설명**: 대기열 토큰을 발급받습니다.
- **Request**:
    - **Body**
        - `userId`: `string` - 사용자 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": {
            "token": "queue-uuid",
            "status": "pending"
          }
        }
        ```
    - **400 Bad Request**: `userId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid userId"
        }
        ```

#### 2. 예약 가능 날짜 조회

- **경로**: `GET /concert/available-dates`
- **설명**: 예약 가능한 날짜 목록을 조회합니다.
- **Request**: 
    - **Headers**
        - `queue-token`: `string` - 대기열 토큰
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": [
            {
              "id": 1,
              "totalSeats": 50,
              "reservedSeats": 38,
              "open_at": "2024-01-01T00:00:00",
              "close_at": "2024-01-01T00:00:00"
            },
            {
              "id": 2,
              "totalSeats": 50,
              "reservedSeats": 48,
              "open_at": "2024-01-03T00:00:00",
              "close_at": "2024-01-03T00:00:00"
            }
          ]
        }
        ```
    - **401 Unauthorized**: 큐 토큰이 없거나 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Unauthorized"
        }
        ```

#### 3. 예약 가능 좌석 조회

- **경로**: `GET /concert/available-seats`
- **설명**: 특정 콘서트 일정에 예약 가능한 좌석 목록을 조회합니다.
- **Request**:
    - **Headers**
        - `queue-token`: `string` - 대기열 토큰
    - **Query Parameters**
        - `concertScheduleId`: `number` - 콘서트 일정 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": [
            {
              "id": 1,
              "seatNumber": "1",
              "price": 1000
            },
            {
              "id": 2,
              "seatNumber": "50",
              "price": 5000
            }
          ]
        }
        ```
    - **400 Bad Request**: `concertScheduleId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid concertScheduleId"
        }
        ```
    - **401 Unauthorized**: 큐 토큰이 없거나 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Unauthorized"
        }
        ```

#### 4. 좌석 예약 요청

- **경로**: `POST /reservation`
- **설명**: 좌석 예약을 요청합니다.
- **Request**:
    - **Headers**
        - `queue-token`: `string` - 대기열 토큰
    - **Body**
        - `seatId`: `number` - 좌석 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": {
            "id": 1,
            "seat": {
              "id": 1,
              "isActive": false,
              "seatNumber": 1
            },
            "status": "PENDING",
            "created_at": "2024-01-01T00:00:00"
          }
        }
        ```
    - **400 Bad Request**: `seatId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid seatId"
        }
        ```
    - **401 Unauthorized**: 큐 토큰이 없거나 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Unauthorized"
        }
        ```

#### 5. 잔액 충전

- **경로**: `POST /user/charge`
- **설명**: 유저의 포인트를 충전합니다.
- **Request**:
    - **Body**
        - `amount`: `number` - 충전할 금액
        - `userId`: `string` - 사용자 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": {
            "balance": 1000
          }
        }
        ```
    - **400 Bad Request**: `amount`나 `userId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid amount or userId"
        }
        ```

#### 6. 잔액 조회

- **경로**: `GET /user/check`
- **설명**: 유저의 포인트 잔액을 조회합니다.
- **Request**:
    - **Query Parameters**
        - `userId`: `string` - 사용자 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": {
            "balance": 1000
          }
        }
        ```
    - **400 Bad Request**: `userId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid userId"
        }
        ```

#### 7. 결제 요청

- **경로**: `POST /payment`
- **설명**: 결제를 요청합니다.
- **Request**:
    - **Headers**
        - `queue-token`: `string` - 대기열 토큰
    - **Body**
        - `seatId`: `number` - 좌석 ID
- **Response**:
    - **200 OK**:
        ```json
        {
          "success": true,
          "data": {
            "seatNumber": 1,
            "concertName": 1,
            "openDate": "2024-01-01T00:00:00",
            "closeDate": "2024-01-01T00:00:00",
            "totalAmount": 1000,
            "status": "PENDING"
          }
        }
        ```
    - **400 Bad Request**: `seatId`가 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Invalid seatId"
        }
        ```
    - **401 Unauthorized**: 큐 토큰이 없거나 유효하지 않을 때
        ```json
        {
          "success": false,
          "message": "Unauthorized"
        }
        ```
</details> -->

## Swagger

<details>
<summary>🔍 Swagger </summary>
<br>

![alt text](image.png)

<br>


![alt text](image-1.png)

<br>


![alt text](image-2.png)

<br>


![alt text](image-3.png)

<br>


![alt text](image-4.png)

<br>


![alt text](image-5.png)

<br>


![alt text](image-6.png)

<br>


![alt text](image-7.png)

</details>