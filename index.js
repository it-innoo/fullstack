require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var favicon = require('serve-favicon')
const morgan = require('morgan')
var path = require('path')

const app = express()
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(favicon(path.join(__dirname, '/', 'favicon.ico')))
app.use(express.static('build'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response
            .status(400)
            .json({ error: error.message })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    Person
        .find()
        .then((persons) => {
            response
                .send(
                    `<p>
        Puhelinluettelossa
        ${persons.length} henkilön tiedot
        </p>
        <p>
          ${new Date()}
        </p>`,
                )
        })
})

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then((persons) => {
            response.json(
                persons.map(
                    person => person.toJSON()
                ))
        })

})

app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    const person = new Person({
        name, number
    })

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(
        request.params.id,
        person,
        { new: true },
    )
        .then((updatedPerson) => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)