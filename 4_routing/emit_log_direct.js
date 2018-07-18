// [direct exchange]
// 上一章使用fanout exchange推播給所有binding的queues
// 這邊使用direct exchange，將指定exchange + routing key (severity) 的message
// 送給指定exchange + "相同"binding key的queues，若都沒有符合的，則discard message

// [Note]: 一個queue可以用不同的keys去binding多次，例如:
// bindQueue(q1, e, k1)
// bindQueue(q2, e, k1)
// bindQueue(q2, e, k2)
// 指定e + k1會送到q1和q2，指定e + k2會送到q2

const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    const ex = 'direct_logs'
    const args = process.argv.slice(2)
    const msg = args.slice(1).join(' ') || 'Hello World!'
    const severity = (args.length > 0) ? args[0] : 'info'

    // 使用direct exchange
    ch.assertExchange(ex, 'direct', {durable: false})
    // 送到指定的key
    ch.publish(ex, severity, new Buffer(msg))
    console.log(' [x] Sent %s: \'%s\'', severity, msg)
  })

  setTimeout(function () {
    conn.close()
    process.exit(0)
  }, 500)
})
