# Race Condition
### DB Lock
장점: 간단하고 정확하게 선착순 처리

단점: 트래픽이 몰리면 DB 락으로 인해 병목

사용: 유저가 적거나 이벤트 수요가 낮은 경우

### Redis + Lua
장점: 빠르다

단점: 영속적이지 않기 때문에 결과 별도 DB 저장 필요

사용: 대규모 이벤트, 플래시 세일

### queue
장점: 트래픽 급증 완충 역할

단점: 클라이언트 즉시 확인 어렵고, 지연이 생길 수 있음

사용: 발급은 중요하나, 실시간성은 조금 낮아도 되는 경우

### pre generated
장점: 발급 로직 없이 단순 분배

단점: 미리 발급된 티켓이 남아있을 수 있음

사용: 단순 수량 제한으로 선착순 처리

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start
```
