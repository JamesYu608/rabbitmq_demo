// 先前的例子，若producer send message時沒有任何consumer，message會直接不見，如何讓message被處理完才從queue中移除?
// [Ack]: Consumer呼叫ch.ack才算處理完，當有consumer斷線 (做很久不算)，RabbitMQ會將沒有ch.ack的messages重送到其它consumer
// Note: Ack預設是true，很常會沒有要用卻忘記加上{noAck: false}
// 這種情況下當然也不會寫ch.ack，導致messages雖然都有處理但是有consumer離線時又全部重送

// [Durability]: RabbitMQ server斷線 (或crash)，回復queue跟message (不完全保證，完全保證看文件)
// 1. 確保queue是durable: 記得producer跟consumer都要
// 2. 確保message是durable: producer的sendToQueue

// [Prefetch]: 一次處理幾個tasks (在全部ch.ack前不會再拿tasks進來，打破round-robin dispatching)

const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const queue = 'taskQueue'

    ch.assertQueue(queue, {durable: true}) // [Durable]: 確保queue是durable
    ch.prefetch(1) // [Prefetch]: 一次處理一個
    console.log(` [*] Waiting for messages in ${queue}.`)
    ch.consume(queue, message => {
      // fake a second of work for every dot in the message body
      const secs = message.content.toString().split('.').length - 1
      console.log(` [x] Received ${message.content.toString()}`)
      setTimeout(() => {
        console.log(' [x] Done')
        ch.ack(message) // [Ack]: 通知RabbitMQ此message已順利完成，必須由接收到此message的channel送出 (跨channel看文件)
      }, secs * 1000)
    }, {noAck: false}) // [Ack]: 啟動acknowledgment機制
  })
})
