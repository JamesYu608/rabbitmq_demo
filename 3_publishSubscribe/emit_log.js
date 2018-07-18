// 這個demo要做一個broadcast的logging機制，一條message會同時發送到多個queues

// [fanout exchange]
// 先前都沒有提到exchange的概念，其實producer不會直接送message到queue，而是送到exchange
// Exchange的功能是負責接收producer來的message，然後決定如何push到queue (e.g. push到多個queues)
// 這個規則稱為exchange type，目前有: direct. topic, headers fanout，這邊以fanout做demo

// 先前的demo，我們沒有設定exchange也可以work，是因為使用了default (nameless) exchange
// 它的類型是direct，沒有名字，在RabbitMQ server一run起來就存在

const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'logs'
    const msg = process.argv.slice(2).join(' ') || 'Hello World!'

    ch.assertExchange(ex, 'fanout', {durable: false})
    // [Publish]: 把message送到所有exchange logs所binding到的queues
    // 若當前沒有任何binding到exchange的queue (沒有consumer)，messages會lost
    // publish的第二個參數是key，fanout用不到 (會被ignore)，下一章會再解說這個key的用途
    ch.publish(ex, '', new Buffer(msg))
    console.log(' [x] Sent %s', msg)
  })

  setTimeout(() => {
    conn.close()
    process.exit(0)
  }, 500)
})
