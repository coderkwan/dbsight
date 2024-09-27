/**
This Module define global vars and functions
 **/

function ById(id) {
    return document.getElementById(id)
}

function createNode(tag) {
    return document.createElement(tag)
}

let token = document.querySelector('input[name="_token"]').getAttribute('value')

function writeRawSQL() {
    ById('display').innerHTML = ''
    ById('create_database_form').style.display = 'none'

    ById('raw_sql').style.display = 'block'
}

ById('raw_sql_form').addEventListener('submit', async e => {
    e.preventDefault()

    let gb = ById('sql_error')
    gb.innerHTML = ''
    gb.style.display = 'none'

    let data = new FormData()
    data.append('sql', e.target.sql.value)

    let response = await fetch('/rawsql', {method: 'post', headers: {'X-CSRF-TOKEN': token}, body: data})

    let body = await response.json()
    if (response.status == 200) {
        renderSqlResponse(body, body[0])
    } else {

        gb.style.display = 'block'
        gb.innerText = body
    }
})

function renderSqlResponse(data, sample) {
    let display = ById('sql_display')
    display.innerHTML = ''

    let suc = createNode('p')
    suc.innerText = 'SQL query ran successfully!'
    suc.classList.add('py-2', 'w-fit', 'mb-2', 'px-4', 'rounded-full', 'bg-green-400', 'text-slate-700')

    display.append(suc)

    if (data.length) {
        let table = createNode('table')
        let head = createNode('thead')
        let body = createNode('tbody')

        for (let i in sample) {
            let h = createNode('th')
            h.innerText = i
            head.append(h)
        }

        for (let i = 0; i < data.length; i++) {
            let tr = createNode('tr')
            for (let j in data[i]) {
                let td = createNode('td')
                td.innerText = data[i][j]
                tr.append(td)
            }
            body.append(tr)
        }

        table.append(head)
        table.append(body)
        display.append(table)
    } else {

        let empty = createNode('p')
        empty.innerText = 'The SQL query returned an empty list!'
        empty.classList.add('py-2', 'w-fit', 'mb-2', 'px-4', 'rounded-full', 'bg-blue-200', 'text-gray-600')
        display.append(empty)

    }
}
