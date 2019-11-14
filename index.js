require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


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

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body

    const person = new Person({
        name, number
    })

    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson.toJSON())
        })
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons
        .find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }

})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons
        .filter(person => person.id !== id)

    res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)