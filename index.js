const net = require('net')
const repl = require('repl')
let connections = 0
let replServers = new Set()

// repl.start({
//   prompt: 'Node.js via stdin> ',
//   input: process.stdin,
//   output: process.stdout,
// })

// net.createServer((socket) => {
//   connections += 1;
//   repl.start({
//     prompt: 'Node.js via Unix socket> ',
//     input: socket,
//     output: socket
//   }).on('exit', () => {
//     socket.end();
//   });
// }).listen('C:\\node-repl-sock');

net
  .createServer((socket) => {
    connections++
    const name = `Guest${connections}`
    const replServer = repl
      .start({
        prompt: `${name}> `,
        input: socket,
        output: socket,
        terminal: true,
      })
      .on('exit', () => {
        replServers.delete(this)
        socket.end()
      })

    replServer.defineCommand('say', {
      help: 'Say something to everyone.',
      action(something) {
        this.clearBufferedCommand()
        replServers.forEach((server) => {
          // if (server !== this) server.output.write('\n')
          server.context.console.log(`${this.context.name}: ${something}`)
        })
        this.displayPrompt()
      },
    })

    replServer.context.name = name

    replServers.add(replServer)
  })
  .listen(5001)
