console.log('header.js load')

const devtalkBtn = document.getElementById('devtalk')


devtalkBtn?.addEventListener('click', e => {
    location.href = '/devtalk'
})