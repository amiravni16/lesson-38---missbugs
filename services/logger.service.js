export const loggerService = {
    debug,
    info,
    warn,
    error
}

function debug(...args) {
    console.log('🐛 DEBUG:', ...args)
}

function info(...args) {
    console.log('ℹ️ INFO:', ...args)
}

function warn(...args) {
    console.log('⚠️ WARN:', ...args)
}

function error(...args) {
    console.log('❌ ERROR:', ...args)
} 