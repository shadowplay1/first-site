const { exec, execSync } = require('child_process')
const platform = process.platform

const {
    readFileSync, readdirSync,
    writeFile, copyFile,
    existsSync, mkdir
} = require('fs')

const package = require('./package.json')

const date = Date.now()
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
}

function removeBuild() {
    if (existsSync('./dist')) {
        if (platform == 'win32') execSync('del /s /q dist')
        else execSync('rm -rf dist')
    }
}

console.log(`${colors.blue}Building ${package.name || __dirname.split('\\').slice(-1)}@${package.version || '1.0.0'}...`)

new Promise((resolve, reject) => {
    exec('npm run buildfiles', err => {
        if (err) {
            const errorLines = stdout.split('\n').slice(4)
            const error = errorLines[0]

            if (!error) {
                const buildDate = Date.now()
                const timeTaken = ((buildDate - date) / 1000).toFixed(3)

                removeBuild()

                console.log()
                console.log(`${colors.red}Build failed:${colors.cyan}`)
                console.log(err)
                console.log()
                console.log(`${colors.yellow}An unexpected error has occured.`)
                console.log(`Time taken: ${colors.green}${timeTaken}s${colors.yellow}.`)
                console.log(`All build files were cleared.${colors.reset}`)
            }

            const data = error.split('(')
            const file = data[0]

            const lineData = data[1].split(')')[0].split(',')

            const line = lineData[0]
            const symbol = lineData[1]

            const buildDate = Date.now()
            const timeTaken = ((buildDate - date) / 1000).toFixed(3)

            removeBuild()

            console.log()
            console.log(`${colors.red}Build failed:${colors.cyan}`)
            console.log(error)
            console.log()
            console.log(`${colors.yellow}Fix the error at ${colors.green}${file}:${line}:${symbol}${colors.yellow} and try again.`)
            console.log(`Time taken: ${colors.green}${timeTaken}s${colors.yellow}.`)
            console.log(`All build files were cleared.${colors.reset}`)
            return
        }

        mkdir('./dist/assets', err => {
            if (err && !existsSync('./dist/assets')) return reject(err)

            mkdir('./dist/data', err => {
                if (err && !existsSync('./dist/data')) return reject(err)

                const dirsArray = [
                    {
                        src: readdirSync('./assets/admin'),
                        path: './assets/admin',
                        dist: './dist/assets/admin'
                    },

                    {
                        src: readdirSync('./assets/css'),
                        path: './assets/css',
                        dist: './dist/assets/css'
                    },

                    {
                        src: readdirSync('./assets/errors'),
                        path: './assets/errors',
                        dist: './dist/assets/errors'
                    },

                    {
                        src: readdirSync('./assets/images'),
                        path: './assets/images',
                        dist: './dist/assets/images'
                    },

                    {
                        src: readdirSync('./assets/js'),
                        path: './assets/js',
                        dist: './dist/assets/js'
                    },

                    {
                        src: readdirSync('./assets/services'),
                        path: './assets/services',
                        dist: './dist/assets/services'
                    }
                ]

                const dataDir = readdirSync('./data')

                for (let i of dataDir) {
                    copyFile(`./data/${i}`, `./dist/data/${i}`, err => {
                        if (err) return reject(err)
                    })
                }

                for (let dirs of dirsArray) {
                    exec(`mkdir ${dirs.dist}`, err => {
                        if (err && !existsSync(dirs.dist)) return reject(err)

                        for (let file of dirs.src) copyFile(dirs.path + `/${file}`, dirs.dist + `/${file}`, err => {
                            if (err) return reject(err)
                        })
                    })
                }

                copyFile('./assets/favicon.ico', './dist/assets/favicon.ico', err => {
                    if (err) return reject(err)

                    copyFile('./assets/main.html', './dist/assets/main.html', err => {
                        if (err) return reject(err)

                        copyFile('./assets/verification.html', './dist/assets/verification.html', err => {
                            if (err) return reject(err)

                            copyFile('./assets/passwordReset.html', './dist/assets/verification.html', err => {
                                if (err) return reject(err)

                                const config = readFileSync('./Config.ts').toString()
                                    .replace('export = ', 'module.exports = ')

                                writeFile('./dist/Config.js', config, err => {
                                    if (err) return reject(err)

                                    const index =
                                        'const Server = require(\'./src/index\')\n' +
                                        'const { port } = require(\'./Config\')\n' +
                                        '\n' +
                                        'new Server(port)'

                                    writeFile('./dist/index.js', index, err => {
                                        if (err) return reject(err)

                                        copyFile('./package.json', './dist/package.json', err => {
                                            if (err) return reject(err)

                                            resolve(true)
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}).then(() => {
    const buildDate = Date.now()
    const timeTaken = ((buildDate - date) / 1000).toFixed(3)

    console.log()
    console.log(`${colors.yellow}dist/index.js       ${timeTaken}s`)
    console.log(`${colors.green}Website built successfully!${colors.reset}`)
}).catch(err => {
    const buildDate = Date.now()
    const timeTaken = ((buildDate - date) / 1000).toFixed(3)

    removeBuild()

    console.log()
    console.log(`${colors.red}Build failed:${colors.cyan}`)
    console.log(err)
    console.log()
    console.log(`${colors.yellow}An unexpected error has occured.`)
    console.log(`Time taken: ${colors.green}${timeTaken}s${colors.yellow}.`)
    console.log(`All build files were cleared.${colors.reset}`)
})