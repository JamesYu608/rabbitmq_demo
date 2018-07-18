const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    const q = 'rpc_queue'

    ch.assertQueue(q, {durable: false})
    ch.prefetch(1)
    console.log(' [x] Awaiting RPC requests')
    ch.consume(q, function reply (msg) {
      const n = parseInt(msg.content.toString())

      console.log(' [.] fib(%d)', n)

      const r = fibonacci(n)

      // 將處理完的資訊，送回client指定的callback queue，帶上原corrId
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(r.toString()),
        {correlationId: msg.properties.correlationId})

      ch.ack(msg)
    })
  })
})

function fibonacci (n) {
  if (n === 0 || n === 1)
    return n
  else
    return fibonacci(n - 1) + fibonacci(n - 2)
}
