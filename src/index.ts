import {Application} from 'express'
import {Request, Response} from 'express'
import { check, validationResult } from 'express-validator'
const express = require('express')
const morgan = require('morgan')
const bodyParser = require("body-parser")
const Recaptcha = require('express-recaptcha').RecaptchaV2
const formData = require('form-data')
const Mailgun = require('mailgun.js')
/*This is handled by docker.*/
/*require('dotenv').config()*/


//start express app
const app: Application = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
const mailgun = new Mailgun(formData)
const mailgunClient = mailgun.client({username: "api", key: process.env.MAILGUN_API_KEY})

const validation = [
  check("formName", "a valid name is required").not().isEmpty().trim().escape(),
  check("formEmail", "please provide a valid email").isEmail(),
  check("formSubject").optional().trim().escape(),
  check("formMessage", "A message must be shorter than 2000 characters").trim().escape().isLength({min:1, max:2000})
]

const handleGetRequest = ((request: Request, response: Response)=> {
  return response.json("this thing is on!")
})


function handlePostRequest(request: Request, response: Response) {
  response.setHeader("Content-Type", "text/html")
  response.setHeader("Access-Control-Allow-Origin", "*")
  const {formName, formEmail, formSubject, formMessage} = request.body

//@ts-ignore typescript does not know request.recaptcha was set by the express-recaptcha middleware
  if(request.recaptcha.error) {
    return response.send(
    `<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong> There was a Recaptcha error. Please try again.</div>`
    )
  }

  const errors = validationResult(request)

  if (errors.isEmpty() === false) {
    const currentError = errors.array()[0]
    return response.send(
      `<div class="alert alert-danger" role="alert"><strong>Oh Snap!</strong>${currentError.msg}</div> `)
  }

  const mailgunMessage = {
    to: process.env.MAIL_RECIPIENT,
    from: `${formName} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
    subject: `${formEmail}:${formSubject}`,
    text: `${formMessage}`
  }

  mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, mailgunMessage)
    .then((msg: any) =>
      response.send(
      `<div class='alert alert-success' role='alert'>Email sent successfully</div>`
    ))
    .catch((error: any) =>{
      console.error(error)
      return response.send(
        `<div class='alert alert-danger' role='alert'><strong>Oh Snap3!</strong> Email Failed. Please Try Again.</div>`
  )})

}

const indexRoute = express.Router()

indexRoute.route('/')
  .get(handleGetRequest)
  .post(recaptcha.middleware.verify, validation, handlePostRequest)

app.use('/apis', indexRoute)

app.listen(4200, () => {
  console.log("express built successfully")
})