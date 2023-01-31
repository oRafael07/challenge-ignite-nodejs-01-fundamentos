import { Database } from "./database.js"
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from "./utils/build-route-path.js"

const database = new Database()

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title || !description) return res.writeHead(400).end(JSON.stringify({ error: "O campo title e description são obrigatorios." }))

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null
      }
      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params

      const existsTask = database.select('tasks', {
        id
      })

      if (!existsTask) return res.writeHead(400).end(JSON.stringify({ error: "o ID da task informada não existe." }))

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      if (!title || !description) return res.writeHead(400).end(JSON.stringify({ error: "O campo title e description são obrigatorios." }))

      const tasksExists = database.select('tasks', {
        id
      })

      if (!tasksExists) return res.writeHead(400).end(JSON.stringify({ error: "o ID da task informada não existe." }))

      database.update('tasks', id, { title, description, updated_at: new Date() })

      return res.writeHead(204).end()
    }
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) return res.writeHead(400).end(JSON.stringify({ error: "o ID da task informada não existe." }))

      const isTaskCompleted = !!task.completed_at

      const newCompletedAt = isTaskCompleted ? null : new Date()

      database.update('tasks', id, { completed_at: newCompletedAt })

      return res.writeHead(204).end()
    }
  }
]