const Config = {
    emailData: {
        emailService: 'gmail',
        email: 'email',
        password: 'password'
    },

    pages: {
        main: {
            functions: 'Расчёт функций',

            'quadratic-equations': 'Квадратные уравнения',
            'number-bases': 'Системы счисления',
            'slovo-o-polku-igoreve': 'Слово о полку Игореве',

            login: 'Вход',
            register: 'Регистрация',

            'password-reset': 'Восстановление пароля'
        },

        admin: {
            construtor: 'Конструктор',
            eval: 'Выполнение кода',
            logs: 'Журнал сайта'
        },

        removed: {
            //'slovo-o-polku-igoreve': 'Слово о полку Игореве'
        }
    }
}

export = Config