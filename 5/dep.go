package main
import (
	"fmt"
	"sync"
	"time"
)

var balance = 0

func teller(deposits chan int, balances chan int) {
	balance := 0
	for {
		select {
		case amount := <-deposits:
			balance = balance + amount
		//case balances <- balance:
		}
	}
}

func channelDeposit(deposits chan int, done chan bool) {
	for i := 0; i<100000; i++ {
		deposits <- 10
	}
	done <- true
}

func mutexDeposit(mu *sync.Mutex, done chan bool) {
	for i :=0; i<100000; i++ {
		mu.Lock()
		balance = balance + 10
		mu.Unlock()
	}
	done <- true
}

func uncheckedDeposit(done chan bool) {
	for i:=0; i<100000; i++ {
		balance = balance + 10
	}
	done <- true
}

func main() {
	done := make(chan bool)
	start := time.Now()
	go uncheckedDeposit(done)
	go uncheckedDeposit(done)
	<- done
	<- done
	fmt.Printf("Balance is %v (%v) \n", balance, time.Since(start))	

	var mu sync.Mutex
	balance = 0
	start = time.Now()
	go mutexDeposit(&mu, done)
	go mutexDeposit(&mu, done)
	<- done
	<- done
	fmt.Printf("Balance is %v (%v) \n", balance, time.Since(start))	

	deposits := make(chan int)
	balances := make(chan int)
	go teller(deposits, balances)

	start = time.Now()
	go channelDeposit(deposits, done)
	go channelDeposit(deposits, done)
	<-done
	<-done
	fmt.Printf("Balance is %v (%v) \n", balance, time.Since(start))	

}













