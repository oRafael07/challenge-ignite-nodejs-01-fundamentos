import { createReadStream } from 'node:fs'
import { parse } from 'csv-parse'
import { resolve } from 'node:path'
import { Readable, Transform } from 'node:stream'

const stream = createReadStream(resolve("./csv/tasks.csv"))

const parseConfig = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2
})

async function run() {

  Readable.toWeb(stream)
    .pipeThrough(Transform.toWeb(parseConfig))
    .pipeThrough(new TransformStream({
      transform(chunk, controller) {

        const [title, description] = chunk

        const FormatedRaw = {
          title,
          description
        }
        controller.enqueue(JSON.stringify(FormatedRaw).concat('\n'))
      }
    }))
    .pipeTo(new WritableStream({
      async write(chunk) {

        const data = JSON.parse(Buffer.from(chunk))

        await fetch('http://localhost:3333/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
          })
        })
      }
    }))

}

run()