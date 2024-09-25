
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
        colorSideBarDB(key)
        createHeader(db)
        renderRowsTable(data.data, data.columns, db, tb, key, data.columns_full)
    } else {
        return 0
    }
}

function colorSideBarDB(key) {
    ById('create_database_form').style.display = "none"
    let listed_dbs = document.getElementsByClassName('db_listed')

    for (let i = 0; i < listed_dbs.length; i++) {
        listed_dbs[i].style.backgroundColor = "white"
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#bbf7d0"
}

function createHeader(database, table, key) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerHTML = `ROWS in the <span class='text-blue-700'>${table}</span> table`
    divs.append(header)

    let btns_cont = createNode('div')
    btns_cont.classList.add('flex', 'items-center', 'gap-3')

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Row'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')
    create_t_btn.type = 'button'

    create_t_btn.addEventListener('click', e => {
        ById('create_row_modal_cont').style.display = 'flex'
        ById('create_row_modal').style.display = 'flex'
    })

    btns_cont.append(create_t_btn)

    let edit_table_btn = createNode('button')
    edit_table_btn.innerText = 'Edit Table'
    edit_table_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    edit_table_btn.type = 'button'
    edit_table_btn.addEventListener('click', e => {
        editTable(database, table, key)
    })
    btns_cont.append(edit_table_btn)

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Table'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    delete_db_btn.addEventListener('click', async e => {
        deleleTable(database, table)
    })
    btns_cont.append(delete_db_btn)

    divs.append(btns_cont)
    displayer.append(divs)
}

function renderRowsTable(data, colu, db, tb, key, columns_full) {
    if (data.length == 0) {
        let error = createNode('p')
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
                editRow(data[i], colu, tb)
            })

            let td_delete = createNode("td")
            let del_btn = createNode('img')
            del_btn.src = 'delete.png'

            let da = new FormData()
            da.append('table', tb)
            da.append('db', db)
            da.append('id', data[i]['id'])

            del_btn.addEventListener('click', async (e) => {
                let de = await fetch('/delete/row', {
                    method: "POST", body: da,
                    headers: {
                        'X-CSRF-TOKEN': token
                    },
                })
                if (de.status == 200) {
                    getRows(db, tb, key)

                } else {
                    let des = await de.json()
                    console.log(des)
                }
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

        let foorm = renderForm(colu, tb, 'Create')[0]
        let foorm_cont = renderForm(colu, tb, 'Create')[1]
        foorm_cont.append(foorm)

        displayer.append(foorm_cont)

        foorm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let da = new FormData(foorm)
            da.append('x_table_', tb)
            da.append('x_db_', db)

            let dr = await fetch('create/row', {
                method: "POST", body: da,
                headers: {
                    'X-CSRF-TOKEN': token
                },
            })
            if (dr.status == 200) {
                foorm.style.display = 'none'
                getRows(db, tb, key)
            } else {
                let er = ById('create_row_error')
                er.style.display = 'flex'
                er.innerText = await dr.json()
            }
        })
    }
}


function editRow(data, colu, tb) {
    let ff = renderForm(colu, tb, 'Edit')
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
            getRows(db, tb, key)
        } else {
            let er = editor.querySelector('#create_row_error')
            er.style.display = 'flex'
            let doner = await dr.json()
            er.innerText = doner
        }
    })
}


