// 讓producer (client) 可以跟consumer (server) 互相通信 (e.g. 當message處理完後通知producer)
// 基本架構就是需要多一個callback queue用來放完成的message
// 對這個queue來說雙方立場反轉，由本來的consumer send message，而producer去拿，流程:
// 1. Client啟動，建立一個"隨機命名的callback queue"
// 2. Client發起request，設定request的corrId和callback queue名稱，發送message到message queue
// 3. Server從message queue中取出該message，處理完request，設定corrId，送回client指定的callback queue
// 4. Client從callback queue中取出message，檢查corrId是否為自己發起的request，做後續處理

const amqp = require('amqplib/callback_api')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('Usage: rpc_client.js num')
  process.exit(1)
}

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    ch.assertQueue('', {exclusive: true}, function (err, q) {
      const corr = generateUuid()
      const num = parseInt(args[0])

      console.log(' [x] Requesting fib(%d)', num)

      ch.consume(q.queue, function (msg) {
        // 檢查corrId是否符合
        if (msg.properties.correlationId === corr) {
          console.log(' [.] Got %s', msg.content.toString())
          setTimeout(function () {
            conn.close()
            process.exit(0)
          }, 500)
        }
      }, {noAck: true}) // 在這個情境下，需要ack

      ch.sendToQueue('rpc_queue',
        new Buffer(num.toString()),
        // [Message Properties]: 總共有14種，一般很少用，除了下列四種:
        // 1. persistent: 第二章介紹過
        // 2. content_type: Encoding的mime-type，例如application/json
        // 3. correlationId: 讓RPC的sender，識別callback queue中的response message是屬於當初哪個request
        // 這樣一個client只需建立一個callback queue，就能mapping多條不同的request/response pair
        // 或者是handle被server重複處理的message (e.g. race condition，甚至處理完但ack發送失敗的case)
        // 4. replyTo: Callback queue的名字
        {correlationId: corr, replyTo: q.queue})
    })
  })
})

function generateUuid () {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString()
}

// 後續考慮:
// 1. 若沒有正在跑的server，client如何處理
// 2. Request是否需要timeout
// 3. 若server發生故障，是否需要通知client
// 4. Server在處理前，對message做驗證 / 限制
