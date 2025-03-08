export function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

export const successfulColor = 'color:rgb(39, 170, 57)'
export const warnfulColor = 'color:rgb(161, 170, 39)'
export const failColor = 'color:rgb(170, 70, 39)'

export const assertLog = (title, isSuccessful) => console.log(`%c ${title}: ${!!isSuccessful}`, isSuccessful ? successfulColor : failColor)