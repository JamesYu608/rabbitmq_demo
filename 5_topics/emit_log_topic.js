// [topic exchange]
// 上一章使用direct exchange + key去送message，但若需要更大的彈性 (只看key是否相等不夠用)，可以使用topic exchange
// 送message時，key是由多個words (用.分開)，所組成的一個string (e.g. '<speed>.<colour>.<species>')
// Queue在binding時，key也是一個string，但用 * 和 # 來做filter (非正規表達式)
// [*]: 剛好一個word
// [#]: 任意數量的words (包括0)
// Example 1 (*.orange.*): 會match 'fast.orange.dog'，不match 'fast.orange.cat.Kitty'
// Example 2 (lazy.#): 會match 'lazy.pig.pig.Sunny'
// Example 3 (#): 像fanout exchange般接收所有messages

const amqp = require('amqplib/callback_api')

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    const ex = 'topic_logs'
    const args = process.argv.slice(2)
    const key = (args.length > 0) ? args[0] : 'anonymous.info'
    const msg = args.slice(1).join(' ') || 'Hello World!'

    ch.assertExchange(ex, 'topic', {durable: false})
    ch.publish(ex, key, new Buffer(msg))
    console.log(' [x] Sent %s: \'%s\'', key, msg)
  })

  setTimeout(function () {
    conn.close()
    process.exit(0)
  }, 500)
})
