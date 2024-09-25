/**
This Module hadles events and call the neccessary functions.
 **/

//Utils
function ById(id) {
    return document.getElementById(id)
}

function createNode(tag) {
    return document.createElement(tag)
}

let prev_table = '';
let token = document.querySelector('input[name="_token"]').getAttribute('value')

// render create row form
function renderForm(colu, tb, what_for) {
    let form_cont = createNode('div')
    form_cont.classList.add('w-screen', 'h-screen', 'bg-[rgba(242,242,242,0.62)]', 'absolute', 'top-0', 'right-0', 'left-0', 'mx-auto')
    form_cont.style.display = 'none'
    form_cont.id = 'create_row_modal_cont'

    let form = createNode('form')
    form.id = 'create_row_modal'
    form.classList.add('rounded-2xl', 'border', 'border-slate-300')

    let x = createNode('button')
    let xp = createNode('h4')
    xp.innerText = what_for + ' row in the ' + tb + ' table'
    xp.classList.add('font-bold')
    x.innerText = 'X'
    x.classList.add('bg-red-400', 'p-2', 'w-[40px]', 'h-[40px]', 'rounded-full', 'align-self-end')
    x.type = 'button'
    x.id = 'close_row_modal'
    let er = createNode('p')
    er.classList.add('hidden')
    er.id = 'create_row_error'
    er.style.color = 'tomato'
    x.addEventListener('click', (e) => {
        form_cont.style.display = 'none'
        form.style.display = 'none'
        er.style.display = 'none'
    })
    let xdiv = createNode('div')
    xdiv.classList.add('flex', 'justify-between', 'items-center')
    xdiv.append(xp)
    xdiv.append(x)
    form.append(xdiv)
    form.append(er)
    for (let i in colu) {
        let d = createNode("div")
        d.classList.add('each_column')
        let label = createNode("label")
        label.innerText = i + " - " + colu[i]
        let input = createNode("input")
        input.type = 'text'
        input.classList.add('p-2', 'border', 'border', 'border-slate-300', 'text-sm', 'rounded-lg')
        input.name = i
        d.append(label)
        d.append(input)
        form.append(d)
    }

    let button = createNode('button')
    button.type = 'submit'
    button.classList.add('bg-green-300', 'text-slate-800', 'rounded-lg')
    button.innerText = what_for
    form.append(button)
    form_cont.append(form)

    return [form, form_cont]
}

