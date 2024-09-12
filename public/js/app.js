
let prev_table = '';
let token = document.querySelector('input[name="_token"]').getAttribute('value')

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
    renderTables(res.data, res.columns, el.parentNode.id, el.innerText)
}

function sidebarDropDownClicked(e, key) {
    let el = e.target
    if (el.classList.contains('active')) {
        el.classList.remove('text-green', 'active')
        el.style.transform = 'rotate(360deg)'
        document.getElementById(`tables_${key}`).classList.add('hidden')
    } else {
        el.classList.add('text-green', 'active')
        el.style.transform = 'rotate(90deg)'
        document.getElementById(`tables_${key}`).classList.remove('hidden')
    }
}

async function innerDBClicked(e, name) {
    console.log('hello')
    let dd = await fetch(`/data/tables?database=${name}`, {method: "get"})
    let data = await dd.json()

    let listed = document.getElementsByClassName('db_listed')
    for (let i = 0; i < listed.length; i++) {
        listed[i].style.backgroundColor = ""
    }
    e.target.style.backgroundColor = "#51f592"

    let displayer = document.getElementById('display')
    displayer.innerHTML = ''
    let mydb = e.target.innerText.trim()

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

        document.getElementById('create_table_modal').addEventListener('submit', async e => {
            e.preventDefault()
            let dd = new FormData(e.target)
            let r = await fetch('/create/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: dd})
            if (r.status == 200) {
                document.getElementById('create_table_modal').style.display = 'none'
                document.getElementById('create_table_error').style.display = 'none'
                // call create table row
            } else {
                document.getElementById('create_table_error').style.display = 'flex'
            }
        })
    })

    divs.append(create_t_btn)

    let delete_db_btn = document.createElement('button')
    delete_db_btn.innerText = 'Delete Database'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('bg-red-500')

    delete_db_btn.addEventListener('click', async e => {
        let d = new FormData()
        d.append('database', mydb)

        let r = await fetch('/delete/database', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: d})
        let f = await r.json();
        if (r.status == 200) {
            window.location.href = "/"
        }
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
            renderTables(res.data, res.columns, e.target.innerText.trim(), Object.values(data[i])[0])
        })


        let da = new FormData()
        da.append('table', Object.values(data[i])[0])
        da.append('database', mydb)

        del_btn.addEventListener('click', async (e) => {
            let dt = await fetch('/delete/table', {
                method: "POST", body: da,
                headers: {
                    'X-CSRF-TOKEN': token
                },
            })
            if (dt.status == 200) {
                tr.remove()
            }
        })

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

    if (data.length == 0) {
        let errp = document.createElement('p')
        let strr = "The Database " + e.target.innerText.trim() + " Has No Tables"
        errp.innerText = strr
        errp.classList.add('text-xl', 'my-4', 'text-orange-500')
        displayer.append(errp)
    }

}


// render row tables
function renderTables(data, colu, db, tb) {
    let displayer = document.getElementById('display')
    displayer.innerHTML = ''

    let divs = document.createElement('div')
    divs.classList.add('flex', 'justify-between', 'items-center')

    let header = document.createElement('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerText = "Rows of the "
    divs.append(header)

    let create_t_btn = document.createElement('button')
    create_t_btn.innerText = 'Create New Row'
    create_t_btn.type = 'button'

    create_t_btn.addEventListener('click', e => {
        document.getElementById('create_row_modal').style.display = 'flex'
    })

    divs.append(create_t_btn)

    let delete_db_btn = document.createElement('button')
    delete_db_btn.innerText = 'Delete Table'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('bg-red-500')

    delete_db_btn.addEventListener('click', async e => {
        let d = new FormData()
        d.append('database', db)
        d.append('table', tb)

        let r = await fetch('/delete/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: d})
        let f = await r.json();
        if (r.status == 200) {
            window.location.href = "/"
        }
    })

    divs.append(delete_db_btn)
    displayer.append(divs)

    let table = document.createElement('table')
    let table_h = document.createElement('thead')
    let table_b = document.createElement('tbody')

    for (let i in colu) {
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
                    'X-CSRF-TOKEN': token
                },
            })
            tr.remove()
        })

        td_delete.append(del_btn)


        for (let b in data[i]) {
            let td = document.createElement("td")
            td.innerText = data[i][b]
            tr.append(td)
        }

        tr.append(td_edit)
        tr.append(td_delete)

        table_b.append(tr)
    }

    table.append(table_h)
    table.append(table_b)
    displayer.append(table)
    displayer.append(renderForm(colu, data, db, tb))

    if (data.length == 0) {
        let ee = document.createElement('p')
        ee.innerText = 'There are no rows in this table'
        displayer.append(ee)
    }

}

// render create row form
function renderForm(colu, data, db, tb) {
    let form = document.createElement('form')
    form.id = 'create_row_modal'
    form.classList.add('absolute', 'top-5', 'mx-auto', 'left-0',
        'right-0', 'border-indigo-800', 'shadow-xl', 'border-2',
        'flex', 'justify-center', 'hidden')

    let x = document.createElement('button')
    x.innerText = 'X'
    x.classList.add('bg-red-500', 'rounded-full', 'p-3', 'w-fit', 'self-end')
    x.type = 'button'
    x.id = 'close_row_modal'
    let er = document.createElement('p')
    er.innerText = 'Failed to create row Please make sure the values have the corect type.'
    er.classList.add('text-red-300', 'hidden')
    x.addEventListener('click', (e) => {
        form.style.display = 'none'
        er.style.display = 'none'
    })
    form.append(x)
    form.append(er)
    for (let i in colu) {
        let d = document.createElement("div")
        d.classList.add('form_element')
        let label = document.createElement("label")
        label.innerText = i + " - " + colu[i]
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

        let dr = await fetch('/create/row', {
            method: "POST", body: da,
            headers: {
                'X-CSRF-TOKEN': token
            },
        })
        if (dr.status == 200) {
            form.style.display = 'none'
            let f = await dr.json()
            renderTables(f.data, f.columns, db, tb)
        } else {
            er.style.display = 'flex'
        }
    })
    return form
}

// add column on create column form
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

    for (let i = 0; ele.length > i; i++) {
        ele[i].value = ''
    }
})


// close create table modal
let close_table_modal = document.getElementById('close_table_modal')
close_table_modal.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.style.display = 'none'
    document.getElementById('create_table_error').style.display = 'none'
    document.getElementById('create_table_db').removeEventListener('submit', () => {return })

})
