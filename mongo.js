const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Salasana uupuu!')
  process.exit(1)
}


const password = process.argv[2]

const url = `mongodb+srv://jahlgren:${password}@cluster0-kagf9.mongodb.net/phonebook?retryWrites=true`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('puhelinluettelo:')

  Person
    .find({})
    .then((persons) => {
      // eslint-disable-next-line array-callback-return
      persons.map((person) => {
        console.log(`${person.name} ${person.number}`)
      })


      mongoose.connection.close()
      process.exit(0)
    })
}

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
})

person.save().then(() => {
  console.log(`lisätään ${person.name} numero ${person.number} luetteloon`)
  mongoose.connection.close()
})