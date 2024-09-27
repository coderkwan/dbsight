
/**

This Module does the following;

1. get rows
2. color the right db
3. create header
4. create main section
5. handle create row
6. handle edit row
7. hadle delete row

 **/

async function getRows(db, tb, key) {
    const res = await fetch(`/data?db=${db}&table=${tb}`, {method: 'get'})
    if (res.status == 200) {
        const data = await res.json()
        colorSideBarDBrows(key)
        createHeaderRows(db, tb, key, data.columns_full, data.columns)
        renderRowsTable(data.data, data.columns, db, tb, key, data.columns_full)
    } else {
        return 0
    }
}

function colorSideBarDBrows(key) {
    ById('create_database_form').style.display = "none"
    let listed_dbs = document.getElementsByClassName('db_listed')

    for (let i = 0; i < listed_dbs.length; i++) {
        listed_dbs[i].style.backgroundColor = "white"
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#bbf7d0"
}

function createHeaderRows(database, table, key, columns_full, colu) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    ById('raw_sql').style.display = 'none'

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold', 'flex', 'gap-1', 'items-center')
    header.innerHTML = `<img src='database.png' alt='database' class='w-[30px]'/><span class='text-blue-700'>${database}</span><img src='table.png' alt='table' class='w-[30px]'/>${table}`
    divs.append(header)

    let btns_cont = createNode('div')
    btns_cont.classList.add('flex', 'items-center', 'gap-3')

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Row'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')
    create_t_btn.type = 'button'

    create_t_btn.addEventListener('click', e => {
        let rendered_form = Edit_or_Create_Row_Form(colu, table, 'Create')
        let foorm = rendered_form[0]
        let foorm_cont = rendered_form[1]
        foorm_cont.style.display = 'flex'
        foorm.style.display = 'flex'

        foorm_cont.append(foorm)

        displayer.append(foorm_cont)

        foorm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let da = new FormData(foorm)
            da.append('x_table_', table)
            da.append('x_db_', database)

            let dr = await fetch('create/row', {
                method: "POST", body: da,
                headers: {
                    'X-CSRF-TOKEN': token
                },
            })
            if (dr.status == 200) {
                foorm.style.display = 'none'
                getRows(database, table, key)
            } else {
                let er = ById('create_row_error')
                er.style.display = 'flex'
                er.innerText = await dr.json()
            }
        })
    })

    btns_cont.append(create_t_btn)

    let edit_table_btn = createNode('button')
    edit_table_btn.innerText = 'Edit Table'
    edit_table_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    edit_table_btn.type = 'button'
    edit_table_btn.addEventListener('click', e => {
        editTable(database, table, key, columns_full)
    })
    btns_cont.append(edit_table_btn)

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Table'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    delete_db_btn.addEventListener('click', async e => {
        deleteTableModal(table, database, key)
    })
    btns_cont.append(delete_db_btn)

    divs.append(btns_cont)
    displayer.append(divs)
}

function renderRowsTable(data, colu, db, tb, key, columns_full) {
    let displayer = ById('display')
    if (data.length == 0) {
        let error = createNode('p')
        error.classList.add('p-2', 'rounded-full', 'text-xs', 'bg-orange-100', 'text-center', 'text-slate-800', 'mt-3', 'border', 'border-slate-400')
        error.innerText = 'There are no rows in this table'
        displayer.append(error)
    } else {
        let displayer = ById('display')
        let table_cont = createNode('div')
        table_cont.classList.add('w-full', 'overflow-scroll', 'h-full')
        let table = createNode('table')
        table.classList.add('table-fixed', 'rounded')
        let table_h = createNode('thead')
        let table_b = createNode('tbody')

        let col_count = Object.keys(colu).length
        let th_edit = createNode("th")
        let th_del = createNode("th")
        th_edit.innerText = "Edit"
        th_del.innerText = "Delete"

        if (col_count > 7) {
            th_edit.classList.add('w-[200px]')
            th_del.classList.add('w-[200px]')
        }

        table_h.append(th_edit)
        table_h.append(th_del)

        for (let i in colu) {
            let th = createNode("th")
            if (col_count > 7) {
                th.classList.add('w-[200px]')
            }
            th.innerText = i
            table_h.append(th)
        }

        for (let i = 0; i < data.length; i++) {
            let tr = createNode("tr")

            let td_edit = createNode("td")
            let edit_btn = createNode('img')
            edit_btn.src = 'edit.png'
            td_edit.append(edit_btn)

            td_edit.addEventListener('click', e => {
                editRow(data[i], colu, tb, db, key)
            })

            let td_delete = createNode("td")
            let del_btn = createNode('img')
            del_btn.src = 'delete.png'

            del_btn.addEventListener('click', async (e) => {
                deleteRowModal(tb, db, key, data[i]['id'])
            })

            td_delete.append(del_btn)
            tr.append(td_edit)
            tr.append(td_delete)

            for (let b in data[i]) {
                let td = createNode("td")
                if (col_count > 7) {
                    td.classList.add('w-[200px]')
                }
                td.innerText = data[i][b]
                tr.append(td)
            }
            table_b.append(tr)
        }

        table.append(table_h)
        table.append(table_b)
        table_cont.append(table)
        displayer.append(table_cont)
    }
}


function editRow(data, colu, tb, db, key) {
    let ff = Edit_or_Create_Row_Form(colu, tb, 'Edit')
    let editor = ff[0]
    let editor_cont = ff[1]
    displayer.append(editor_cont)

    editor_cont.style.display = 'flex'
    editor.style.display = 'flex'

    for (let y in data) {
        editor.elements[`${y}`].value = data[y]
        let oll = createNode('input')
        oll.name = "all_old_" + editor.elements[`${y}`].name
        oll.value = data[y]
        oll.hidden = true
        editor.append(oll)
    }

    editor.addEventListener('submit', async (e) => {
        e.preventDefault()
        let da = new FormData(editor)
        da.append('x_table_', tb)
        da.append('x_db_', db)

        let dr = await fetch('edit/row', {
            method: "POST", body: da,
            headers: {
                'X-CSRF-TOKEN': token
            },
        })
        if (dr.status == 200) {
            editor.style.display = 'none'
            editor_cont.style.display = 'none'
            getRows(db, tb, key)
        } else {
            let er = editor.querySelector('#create_row_error')
            er.style.display = 'flex'
            let doner = await dr.json()
            er.innerText = doner
        }
    })
}

function Edit_or_Create_Row_Form(colu, tb, what_for) {
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
        // form.style.display = 'none'
        ById('create_row_modal_cont').style.display = 'none'
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

function deleteRowModal(table, database, key, id) {
    const wrapper = createNode('div')
    const modal = createNode('div')
    const modal_cancel = createNode('button')
    const modal_submit = createNode('button')
    const modal_text = createNode('p')
    const text = `Are you sure you want to delete the row of id <span class='font-bold text-indigo-500'>${id}</span>?`

    wrapper.classList.add('w-screen', 'h-screen', 'absolute', 'top-0', 'right-0', 'left-0', 'mx-auto', 'bg-[rgba(105,105,105,0.53)]')
    modal.classList.add('bg-white', 'border', 'rounded-2xl', 'border-slate-300', 'p-4', 'absolute', 'top-5', 'max-w-[700px]', 'mx-auto', 'left-0', 'right-0', 'text-center')

    modal_cancel.type = 'button'
    modal_submit.type = 'button'
    modal_cancel.innerText = 'Cancel'
    modal_submit.innerText = 'Delete Row'
    modal_cancel.classList.add('bg-red-400', 'text-slate-100', 'rounded-lg', 'py-2', 'px-5', 'me-2', 'font-bold')
    modal_submit.classList.add('bg-green-100', 'border', 'border-slate-400', 'text-slate-600', 'rounded-lg', 'py-2', 'px-5', 'me-2', 'font-bold')
    modal_text.classList.add('text-lg', 'my-5')

    modal_text.innerHTML = text

    modal.append(modal_text)
    modal.append(modal_cancel)
    modal.append(modal_submit)
    wrapper.append(modal)
    ById('display').append(wrapper)

    modal_cancel.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
    })

    modal_submit.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
        deleteRow(table, database, key, id)
    })
}

async function deleteRow(tb, db, key, id) {
    let da = new FormData()
    da.append('table', tb)
    da.append('db', db)
    da.append('id', id)

    let de = await fetch('/delete/row', {
        method: "POST", body: da,
        headers: {
            'X-CSRF-TOKEN': token
        },
    })
    if (de.status == 200) {
        getRows(db, tb, key)
    } else {
        let gb = ById('global_error')
        gb.style.display = 'flex'
        gb.innerText = await de.json()
        setTimeout(() => {
            gb.style.display = 'none'
            gb.innerText = ''
        }, 5000)
    }
}

