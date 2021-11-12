import { createTransport, Transporter } from 'nodemailer'

import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

import { emailData } from '../../Config'

class Email {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>

    constructor() {
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: emailData.email,
                pass: emailData.password
            }
        })

        this.transporter = transporter
    }

    
    async send(receiverEmail: string, content: Required<Pick<Mail.Options, 'subject' | 'text' | 'html'>>) {
        return this.transporter.sendMail({
            from: `Тестовый сайт <${emailData.email}>`,
            to: receiverEmail,

            subject: content.subject,
            text: content.text,
            html: content.html,
        })
    }
}

export = Email