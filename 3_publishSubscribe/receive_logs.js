const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'logs'

    ch.assertExchange(ex, 'fanout', {durable: false})

    // [Temporary Queue]: 若queue的名稱為empty string，RabbitMQ server生成一個empty queue，名字為隨機產生
    // [Exclusive]: Queue只允許一個declaring connection，當這個connection關閉時自動delete這個queue
    // 這邊也就是說當consumer結束時，自動delete剛建的temporary queue
    ch.assertQueue('', {exclusive: true}, function (err, q) {
      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q.queue)
      // [Binding]: 連繫exchange和queue，現在exchange logs會送message到我們的temporary queue
      ch.bindQueue(q.queue, ex, '')

      ch.consume(q.queue, (msg) => {
        console.log(' [x] %s', msg.content.toString())
      }, {noAck: true})
    })
  })
})
