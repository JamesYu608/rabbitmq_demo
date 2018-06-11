const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const queue = 'taskQueue'

    ch.assertQueue(queue, {durable: true})
    console.log(` [*] Waiting for messages in ${queue}.`)
    ch.consume(queue, message => {
      // fake a second of work for every dot in the message body
      const secs = message.content.toString().split('.').length - 1
      console.log(` [x] Received ${message.content.toString()}`)
      setTimeout(() => {
        console.log(' [x] Done')
      }, secs * 1000)
    }, {noAck: true})
  })
})
