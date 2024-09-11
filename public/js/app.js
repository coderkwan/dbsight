
let prev_table = '';

async function tableClicked(e, key, parent_k) {
    let el = e.target

    if (el.classList.contains('active')) {

    } else {
        let prev = document.getElementById(prev_table)
        if (prev) {
            prev.style.color = ''
            prev.style.borderColor = ''
            prev.classList.remove('active')
        }

        el.classList.add('active')
        el.style.color = 'blue'
        el.style.borderColor = 'blue'
        prev_table = 'table_' + parent_k + '_' + key
    }

    const d = await fetch(`/data?db=${el.parentNode.id}&table=${el.innerText}`, {method: 'get'})
    const res = await d.json()
    renderTables(res.data, el.parentNode.id, el.innerText)
}

function dbClicked(e, key) {
    let el = e.target

    if (el.classList.contains('active')) {
        el.classList.remove('text-green', 'active')
        document.getElementById(`tables_${key}`).classList.add('hidden')
    } else {
        el.classList.add('text-green', 'active')
        document.getElementById(`tables_${key}`).classList.remove('hidden')
    }
}

function innerDBClicked(e, data) {
    let displayer = document.getElementById('display')
    displayer.innerHTML = ''
    let mydb = e.target.innerText.trim()

    if (data.length > 0) {
        let divs = document.createElement('div')
        divs.classList.add('flex', 'justify-between', 'items-center')

        let header = document.createElement('h2')
        header.classList.add('text-2xl', 'font-bold')
        header.innerText = "Tables of the " + mydb + " Database;"
        divs.append(header)

        let create_t_btn = document.createElement('button')
        create_t_btn.innerText = 'Create New Table'
        create_t_btn.type = 'button'
        create_t_btn.addEventListener('click', e => {
            document.getElementById('create_table_modal').style.display = 'flex'
            document.getElementById('create_table_db').value = mydb
        })
        divs.append(create_t_btn)

        let delete_db_btn = document.createElement('button')
        delete_db_btn.innerText = 'Delete Database'
        delete_db_btn.type = 'button'
        delete_db_btn.classList.add('bg-red-500')
        delete_db_btn.addEventListener('click', e => {
        })

        divs.append(delete_db_btn)
        displayer.append(divs)

        let table = document.createElement('table')
        let table_h = document.createElement('thead')
        let table_b = document.createElement('tbody')

        let th_edit = document.createElement("th")
        th_edit.innerText = "Edit"
        let th_delete = document.createElement("th")
        th_delete.innerText = "Delete"

        let th = document.createElement("th")
        th.innerText = "Tables"
        table_h.append(th)

        for (let i = 0; i < data.length; i++) {
            let tr = document.createElement("tr")

            let td_view = document.createElement("td")
            let view_btn = document.createElement('button')
            view_btn.innerText = 'View'
            td_view.append(view_btn)

            let td_edit = document.createElement("td")
            let edit_btn = document.createElement('button')
            edit_btn.innerText = 'Edit'
            td_edit.append(edit_btn)

            let td_delete = document.createElement("td")
            let del_btn = document.createElement('button')
            del_btn.innerText = 'Delete'

            view_btn.addEventListener('click', async () => {
                const d = await fetch(`/data?db=${e.target.innerText.trim()}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                const res = await d.json()
                renderTables(res.data, e.target.innerText.trim(), Object.values(data[i])[0])
            })


            // let da = new FormData()
            // da.append('table', tb)
            // da.append('db', db)
            // da.append('id', data[i]['id'])

            // del_btn.addEventListener('click', async (e) => {
            //     await fetch('/delete/table', {
            //         method: "POST", body: da,
            //         headers: {
            //             'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').getAttribute('value')
            //         },
            //     })
            //     tr.remove()
            // })

            td_delete.append(del_btn)


            for (let b in data[i]) {
                let td = document.createElement("td")
                td.innerText = data[i][b]
                tr.append(td)
            }

            tr.append(td_view)
            tr.append(td_edit)
            tr.append(td_delete)

            table_b.append(tr)
        }

        table.append(table_h)
        table.append(table_b)
        displayer.append(table)

    } else {

        displayer.innerHTML = `<p>The Database ${e.target.innerText} Has No Tables</p>`
    }

}
function renderTables(data, db, tb) {
    let displayer = document.getElementById('display')
    if (data.length > 0) {

        let table = document.createElement('table')
        let table_h = document.createElement('thead')
        let table_b = document.createElement('tbody')

        let th_edit = document.createElement("th")
        th_edit.innerText = "Edit"
        let th_delete = document.createElement("th")
        th_delete.innerText = "Delete"

        table_h.append(th_delete)
        table_h.append(th_edit)


        for (let i in data[0]) {
            let th = document.createElement("th")
            th.innerText = i
            table_h.append(th)
        }

        for (let i = 0; i < data.length; i++) {
            let tr = document.createElement("tr")

            let td_edit = document.createElement("td")
            let edit_btn = document.createElement('button')
            edit_btn.innerText = 'Edit'
            td_edit.append(edit_btn)

            let td_delete = document.createElement("td")
            let del_btn = document.createElement('button')
            del_btn.innerText = 'Delete'

            let da = new FormData()
            da.append('table', tb)
            da.append('db', db)
            da.append('id', data[i]['id'])

            del_btn.addEventListener('click', async (e) => {
                await fetch('/delete/row', {
                    method: "POST", body: da,
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').getAttribute('value')
                    },
                })
                tr.remove()
            })

            td_delete.append(del_btn)

            tr.append(td_delete)
            tr.append(td_edit)

            for (let b in data[i]) {
                let td = document.createElement("td")
                td.innerText = data[i][b]
                tr.append(td)
            }
            table_b.append(tr)
        }

        table.append(table_h)
        table.append(table_b)
        displayer.innerHTML = ''
        displayer.append(table)
        displayer.append(renderForm(data[0], db, tb))

    } else {
        displayer.innerHTML = "<p>No data</p>"
    }

}

function renderForm(data, db, tb) {
    let form = document.createElement('form')
    for (let i in data) {
        let d = document.createElement("div")
        d.classList.add('form_element')
        let label = document.createElement("label")
        label.innerText = i
        let input = document.createElement("input")
        input.type = 'text'
        input.name = i
        d.append(label)
        d.append(input)
        form.append(d)
    }

    let button = document.createElement('button')
    button.type = 'submit'
    button.innerText = 'Create'
    form.append(button)

    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        let da = new FormData(form)
        da.append('x_table_', tb)
        da.append('x_db_', db)

        await fetch('/create/row', {
            method: "POST", body: da,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').getAttribute('value')
            },
        })
        console.log('go')
    })
    return form
}

let add_column_btn = document.getElementById('add_column_btn')
let _column = document.getElementById('each_column')
let columns = document.getElementById('all_columns')
let columns_list = []

add_column_btn.addEventListener('click', (e) => {
    let id = Math.random() * 10
    let copy = _column.cloneNode(true)
    copy.id = id

    let deleter = document.createElement('button')
    deleter.innerHTML = 'delete'
    deleter.type = 'button'
    deleter.classList.add('bg-red-300', 'border', 'rounded', 'pointer')

    deleter.addEventListener('click', (e) => {
        copy.remove()
    })

    copy.append(deleter)
    columns.append(copy)

    let ele = document.getElementById(id).getElementsByTagName('input')
    console.log(ele)
    console.log(ele.length)
    console.log(ele[0])

    for (let i = 0; ele.length > i; i++) {
        ele[i].value = ''
    }
})



let close_table_modal = document.getElementById('close_table_modal')

close_table_modal.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.style.display = 'none'
})
