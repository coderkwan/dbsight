
let prev_table = '';
let token = document.querySelector('input[name="_token"]').getAttribute('value')

async function getRows(db, tb, key) {
    const d = await fetch(`/data?db=${db}&table=${tb}`, {method: 'get'})
    const res = await d.json()
    renderRowsTable(res.data, res.columns, db, tb, key, res.columns_full)
}

async function sidebarDropDownClicked(e, key, name) {
    let el = e.target
    if (el.classList.contains('active')) {
        el.classList.remove('active')
        el.innerText = "+"
        ById(`tables_${key}`).style.display = 'none'
    } else {
        el.classList.add('active')
        el.innerText = "-"
        ById(`tables_${key}`).style.display = 'flex'
        let p = ById(`tables_${key}`)

        let dd = await fetch(`/data/tables?database=${name}`, {method: "get"})
        let data = await dd.json()
        p.innerHTML = ''

        for (let i = 0; i < data.length; i++) {
            let d = createNode('div')
            d.id = key + "_" + i
            d.classList.add('ms-2', 'cursor-pointer', 'mt-1', 'p-2', 'border', 'border-slate-300', 'rounded-md', 'bg-slate-200', 'text-slate-800')
            let tab = data[i][`Tables_in_${name}`]
            d.innerText = tab
            d.addEventListener('click', () => getRows(name, tab, key))
            p.append(d)
        }
    }
}

async function getTables(e, name, key) {
    let dd = await fetch(`/data/tables?database=${name}`, {method: "get"})
    let data = await dd.json()

    ById('create_database_form').style.display = "none"

    let listed = document.getElementsByClassName('db_listed')
    for (let i = 0; i < listed.length; i++) {
        listed[i].style.backgroundColor = "white"
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#bbf7d0"

    let bc_tb = document.getElementsByClassName('bc_tb')
    for (let i = 0; i < bc_tb.length; i++) {
        bc_tb[i].remove();
    }

    let displayer = ById('display')
    displayer.innerHTML = ''
    let mydb = name

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerHTML = `TABLES in the <span class='text-blue-700'>${mydb}</span> Database`
    divs.append(header)

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Table'
    create_t_btn.type = 'button'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')

    create_t_btn.addEventListener('click', e => {
        ById('create_table_modal').style.display = 'flex'
        ById('create_table_db').value = mydb
        ById('create_table_title').innerText = 'Create a new table in the ' + mydb + " database"

        ById('create_table_modal').addEventListener('submit', async e => {
            e.preventDefault()
            let dd = new FormData(e.target)
            let r = await fetch('/create/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: dd})
            if (r.status == 200) {
                ById('create_table_modal').style.display = 'none'
                ById('create_table_error').style.display = 'none'
                // call create table row
                getTables(e, e.target.db.value, key)
            } else {
                ById('create_table_error').style.display = 'flex'
                ById('create_table_error').innerText = await r.json()
            }
        })
    })


    let rename_btn = createNode('button')
    rename_btn.innerText = 'Rename Database'
    rename_btn.type = 'button'
    rename_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')

    rename_btn.addEventListener('click', async e => {
        ById('rename_databese').style.display = 'flex'
        let formm = ById('rename_databese_form')
        formm.elements['name'].value = mydb
        formm.elements['old_name'].value = mydb
        formm.addEventListener('submit', async e => {
            e.preventDefault()
            let d = new FormData(formm)
            let r = await fetch('database/rename', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: d})
            let f = await r.json();
            if (r.status != 200) {
                let gb = ById('rename_error')
                gb.style.display = 'flex'
                gb.innerText = f
                setTimeout(() => {
                    gb.style.display = 'none'
                    gb.innerText = ''
                }, 5000)
            } else {
                window.location.href = '/'
            }
        })

        ById('close_rename_modal').addEventListener('click', (e) => {
            ById('rename_databese').style.display = 'none'
        })
    })

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Database'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')

    delete_db_btn.addEventListener('click', async e => {
        let d = new FormData()
        d.append('database', mydb)

        let r = await fetch('/delete/database', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: d})
        let f = await r.json();
        if (r.status == 200) {
            window.location.href = "/"
        } else {
            let gb = ById('global_error')
            gb.style.display = 'flex'
            gb.innerText = f
            setTimeout(() => {
                gb.style.display = 'none'
                gb.innerText = ''
            }, 5000)
        }
    })

    let h_btn_cont = createNode('div')
    h_btn_cont.classList.add('flex', 'gap-3', 'items-center')
    h_btn_cont.append(create_t_btn)
    h_btn_cont.append(rename_btn)
    h_btn_cont.append(delete_db_btn)
    divs.append(h_btn_cont)
    displayer.append(divs)

    let tables_cont = createNode('div')
    tables_cont.classList.add('flex', 'flex-col', 'gap-3', 'mt-6')


    for (let i = 0; i < data.length; i++) {
        let each_table = createNode("div")
        each_table.classList.add('flex', 'py-2', 'px-4', 'rounded-lg', 'bg-white', 'border', 'border-slate-200', 'gap-3', 'justify-between', 'items-center')

        let view_btn = createNode('button')
        view_btn.classList.add('bg-slate-400', 'rounded-lg', 'text-white')
        view_btn.innerText = 'View Table'

        let del_btn = createNode('button')
        del_btn.classList.add('bg-rose-200', 'rounded-lg', 'text-slate-600')
        del_btn.innerText = 'Delete Table'
        let btn_cont = createNode("div")
        btn_cont.classList.add('flex', 'gap-3', 'justify-between', 'items-center')
        btn_cont.append(view_btn)
        btn_cont.append(del_btn)


        view_btn.addEventListener('click', async () => {
            const d = await fetch(`/data?db=${mydb}&table=${Object.values(data[i])[0]}`, {method: 'get'})
            const res = await d.json()
            renderRowsTable(res.data, res.columns, mydb, Object.values(data[i])[0], key, res.columns_full)
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
                getTables(e, mydb, key)
            } else {
                let gb = ById('global_error')
                gb.style.display = 'flex'
                gb.innerText = await dt.json()
                setTimeout(() => {
                    gb.style.display = 'none'
                    gb.innerText = ''
                }, 5000)
            }
        })

        for (let b in data[i]) {
            let td = createNode("p")
            td.classList.add('text-lg', 'font-bold', 'text-slate-700', 'cursor-pointer')
            td.innerText = data[i][b]

            td.addEventListener('click', async () => {
                const d = await fetch(`/data?db=${mydb}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                const res = await d.json()
                renderRowsTable(res.data, res.columns, mydb, Object.values(data[i])[0], key, res.columns_full)
            })

            each_table.append(td)
        }

        each_table.append(btn_cont)
        tables_cont.append(each_table)
    }

    displayer.append(tables_cont)

    if (data.length == 0) {
        let errp = createNode('p')
        let strr = "The Database " + mydb + " Has No Tables"
        errp.innerText = strr
        errp.classList.add('text-xl', 'my-4', 'text-orange-500')
        displayer.append(errp)
    }

}
let model = ById('edit_each_column')
let add_col = ById('add_column_on_edit')

add_col.addEventListener('click', h => {
    let new_mode = model.cloneNode(true)
    new_mode.classList.add('cloned')
    new_mode.style.display = 'flex'

    let bt = createNode('button')
    bt.style.backgroundColor = 'green'
    bt.innerText = 'Save'
    bt.type = 'button'

    bt.addEventListener('click', async e => {
        e.preventDefault()

        let name = new_mode.querySelector('input[name="column[]"]').value
        let type = new_mode.querySelector('input[name="type[]"]').value
        let _default = new_mode.querySelector('input[name="DEFAULT[]"]').value
        let key = new_mode.querySelector('select[name="PRIMARY[]"]').value
        let _null = new_mode.querySelector('select[name="NULL[]"]').value
        let ai = new_mode.querySelector('select[name="AI[]"]').value
        let unique = new_mode.querySelector('select[name="UNIQUE[]"]').value

        if (name.trim().length > 0 && type.trim().length > 0) {
            let fd = new FormData()
            fd.append('db', ById('edit_table_db').value)
            fd.append('table', ById('edit_table_table').value)
            fd.append('column', name)
            fd.append('type', type)
            fd.append('key', key)
            fd.append('_null', _null)
            fd.append('unique', unique)
            fd.append('ai', ai)
            fd.append('_default', _default)

            let r = await fetch('table/createcolumn', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: fd})
            let rd = await r.json()

            if (r.status == 200) {
                ById('edit_table_error').innerText = "Column added!"
                ById('edit_table_error').style.color = "green"
                ById('edit_table_error').style.display = "flex"

                setTimeout(() => ById('edit_table_error').style.display = "none"
                    , 4000)
            } else {
                ById('edit_table_error').innerText = rd
                ById('edit_table_error').style.color = "red"
                ById('edit_table_error').style.display = "flex"
            }
        } else {
            ById('edit_table_error').innerText = 'Name and Type is required!'
            ById('edit_table_error').style.color = "red"
            ById('edit_table_error').style.display = "flex"
        }

    })

    let btt = createNode('button')
    btt.classList.add('bg-red-500')
    btt.innerText = 'Delete'
    btt.type = 'button'

    new_mode.append(bt)
    new_mode.append(btt)

    ById('all_edit_columns').append(new_mode)

    btt.addEventListener('click', d => {
        d.target.parentNode.remove()
    })
})

// render row tables
function renderRowsTable(data, colu, db, tb, key, columns_full) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    ById('create_database_form').style.display = "none"

    let listed = document.getElementsByClassName('db_listed')
    for (let i = 0; i < listed.length; i++) {
        listed[i].style.backgroundColor = "white"
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#bbf7d0"

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerHTML = `ROWS in the <span class='text-blue-700'>${tb}</span> table`
    divs.append(header)

    let btns_cont = createNode('div')
    btns_cont.classList.add('flex', 'items-center', 'gap-3')

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Row'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')
    create_t_btn.type = 'button'

    create_t_btn.addEventListener('click', e => {
        ById('create_row_modal').style.display = 'flex'
    })

    btns_cont.append(create_t_btn)

    let edit_table_btn = createNode('button')
    edit_table_btn.innerText = 'Edit Table'
    edit_table_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    edit_table_btn.type = 'button'

    let edit_tab = ById('edit_table_modal')
    let keyi = createNode('input')
    keyi.hidden = 'true'
    keyi.name = 'key'
    keyi.id = 'edit_table_modal_key'
    keyi.value = key
    edit_tab.append(keyi)

    let col_cont = edit_tab.querySelector('#all_edit_columns')
    let mode = ById('edit_each_column')
    col_cont.innerHTML = ''

    // does this work 👇
    let clonedNodes = document.querySelectorAll('.cloned');
    clonedNodes.forEach(node => node.remove());

    edit_table_btn.addEventListener('click', e => {
        edit_tab.style.display = 'flex'

        edit_tab.querySelector('input[name="name"]').value = tb
        edit_tab.querySelector('input[name="old_name"]').value = tb
        edit_tab.querySelector('input[name="db"]').value = db

        for (let z in columns_full) {
            let new_mode = mode.cloneNode(true)
            new_mode.style.display = 'flex'

            new_mode.querySelector('input[name="column[]"]').value = z
            new_mode.querySelector('input[name="type[]"]').value = columns_full[z]['Type']
            new_mode.querySelector('input[name="DEFAULT[]"]').value = columns_full[z]['Default']
            new_mode.querySelector('select[name="PRIMARY[]"]').value = columns_full[z]['Key'] == 'PRI' ? 'PRIMARY KEY' : ""
            new_mode.querySelector('select[name="NULL[]"]').value = columns_full[z]['Null'] == 'NO' ? 'NOT NULL' : ""
            new_mode.querySelector('select[name="AI[]"]').value = columns_full[z]['Extra'] == 'auto_increment' ? 'AUTO_INCREMENT' : ""
            new_mode.querySelector('select[name="UNIQUE[]"]').value = columns_full[z]['Unique'] == true ? 'UNIQUE' : ""

            let old_name = createNode('input')
            old_name.value = z
            old_name.name = 'old_names[]'
            old_name.style.display = 'none'
            new_mode.append(old_name)

            let saver = createNode('button')
            saver.type = 'button'
            saver.classList.add('border', 'p-2', 'cursor-pointer')
            saver.style.backgroundColor = 'green'
            saver.innerText = 'Save'

            saver.addEventListener('click', async (e) => {
                e.preventDefault()
                let new_name = new_mode.querySelector('input[name="column[]"]').value
                let type = new_mode.querySelector('input[name="type[]"]').value
                let _default = new_mode.querySelector('input[name="DEFAULT[]"]').value
                let key = new_mode.querySelector('select[name="PRIMARY[]"]').value
                let _null = new_mode.querySelector('select[name="NULL[]"]').value
                let ai = new_mode.querySelector('select[name="AI[]"]').value
                let unique = new_mode.querySelector('select[name="UNIQUE[]"]').value

                let fd = new FormData()
                fd.append('db', ById('edit_table_db').value)
                fd.append('table', ById('edit_table_table').value)
                fd.append('column', z)
                fd.append('new_name', new_name)
                fd.append('type', type)
                fd.append('key', key)
                fd.append('_null', _null)
                fd.append('unique', unique)
                fd.append('ai', ai)
                fd.append('_default', _default)

                let r = await fetch('table/updatecolumn', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: fd})
                let rd = await r.json()

                if (r.status == 200) {
                    ById('edit_table_error').innerText = "Column updated!"
                    ById('edit_table_error').style.color = "green"
                    ById('edit_table_error').style.display = "flex"

                    setTimeout(() => ById('edit_table_error').style.display = "none"
                        , 4000)
                } else {
                    ById('edit_table_error').innerText = rd
                    ById('edit_table_error').style.color = "red"
                    ById('edit_table_error').style.display = "flex"
                }
            })

            let deleter = createNode('button')
            deleter.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
            deleter.type = 'button'
            deleter.innerText = 'Delete'

            deleter.addEventListener('click', async (e) => {
                e.preventDefault()

                let fd = new FormData()
                fd.append('db', ById('edit_table_db').value)
                fd.append('table', ById('edit_table_table').value)
                fd.append('column', z)

                let r = await fetch('table/deletecolumn', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: fd})
                let rd = await r.json()

                if (r.status == 200) {
                    ById('edit_table_error').innerText = "Column Deleted!"
                    ById('edit_table_error').style.color = "green"
                    ById('edit_table_error').style.display = "flex"
                    new_mode.remove()

                    setTimeout(() => ById('edit_table_error').style.display = "none"
                        , 4000)
                } else {
                    ById('edit_table_error').innerText = rd
                    ById('edit_table_error').style.color = "red"
                    ById('edit_table_error').style.display = "flex"
                }
            })

            new_mode.append(saver)
            new_mode.append(deleter)
            col_cont.append(new_mode)
        }

    })

    btns_cont.append(edit_table_btn)

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Table'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')

    delete_db_btn.addEventListener('click', async e => {
        let d = new FormData()
        d.append('database', db)
        d.append('table', tb)

        let r = await fetch('/delete/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: d})
        let f = await r.json();
        if (r.status == 200) {
            getTables(e, db, key)
        } else {
            let gb = ById('global_error')
            gb.style.display = 'flex'
            gb.innerText = f
            setTimeout(() => {
                gb.style.display = 'none'
                gb.innerText = ''
            }, 5000)
        }
    })

    btns_cont.append(delete_db_btn)
    divs.append(btns_cont)
    displayer.append(divs)

    let table_cont = createNode('div')
    table_cont.classList.add('w-full', 'overflow-scroll', 'h-full')
    let table = createNode('table')
    table.classList.add('table-fixed', 'rounded')
    let table_h = createNode('thead')
    let table_b = createNode('tbody')
    // table_h.classList.add('bg-white', 'p-4', 'text-lg')

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
        // edit_btn.classList.add('rounded-md', 'bg-blue-300', 'text-slate-800')
        td_edit.append(edit_btn)

        td_edit.addEventListener('click', e => {
            let editor = renderForm(colu, tb, 'Edit')
            displayer.append(editor)
            editor.style.display = 'flex'

            for (let y in data[i]) {
                editor.elements[`${y}`].value = data[i][y]
                let oll = createNode('input')
                oll.name = "all_old_" + editor.elements[`${y}`].name
                oll.value = data[i][y]
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
        })

        let td_delete = createNode("td")
        let del_btn = createNode('img')
        del_btn.src = 'delete.png'
        // del_btn.classList.add('rounded-md', 'bg-red-300', 'text-slate-800')

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

    let foorm = renderForm(colu, tb, 'Create')
    displayer.append(foorm)

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


    if (data.length == 0) {
        let ee = createNode('p')
        ee.innerText = 'There are no rows in this table'
        displayer.append(ee)
    }

}

// render create row form
function renderForm(colu, tb, what_for) {
    let form = createNode('form')
    form.id = 'create_row_modal'
    form.style.display = 'none'

    let x = createNode('button')
    let xp = createNode('h4')
    xp.innerText = what_for + ' row in the ' + tb + ' table'
    xp.classList.add('font-bold')
    x.innerText = 'X'
    x.classList.add('bg-red-500', 'p-3', 'w-fit', 'rounded', 'align-self-end')
    x.type = 'button'
    x.id = 'close_row_modal'
    let er = createNode('p')
    er.classList.add('hidden')
    er.id = 'create_row_error'
    er.style.color = 'tomato'
    x.addEventListener('click', (e) => {
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
        input.classList.add('p-2', 'border', 'text-sm')
        input.name = i
        d.append(label)
        d.append(input)
        form.append(d)
    }

    let button = createNode('button')
    button.type = 'submit'
    button.innerText = what_for
    form.append(button)

    return form
}

// add column on create column form
let add_column_btn = ById('add_column_btn')
let _column = ById('each_column')
let columns = ById('all_columns')
let columns_list = []
add_column_btn.addEventListener('click', (e) => {
    let id = Math.random() * 10
    let copy = _column.cloneNode(true)
    copy.id = id

    let deleter = createNode('button')
    deleter.innerHTML = 'delete'
    deleter.type = 'button'
    deleter.classList.add('bg-red-300', 'border', 'pointer')

    deleter.addEventListener('click', (e) => {
        copy.remove()
    })

    copy.append(deleter)
    columns.append(copy)

    let ele = ById(id).getElementsByTagName('input')
    let sel = ById(id).getElementsByTagName('option')

    for (let i = 0; ele.length > i; i++) {
        ele[i].value = ''
    }
    for (let i = 0; sel.length > i; i++) {
        sel[i].selected = false
    }
})

// close create table modal
let close_table_modal = ById('close_table_modal')
close_table_modal.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.style.display = 'none'
    ById('create_table_error').style.display = 'none'
    ById('create_table_db').removeEventListener('submit', () => {return })

})

// close edit table modal
let close_edit_table_modal = ById('close_edit_table_modal')
close_edit_table_modal.addEventListener('click', (e) => {
    e.target.parentNode.parentNode.style.display = 'none'
    // ById('edit_table_error').style.display = 'none'
    ById('edit_table_modal').removeEventListener('submit', () => {return })
    ById('all_edit_columns').innerHTML = ''

    let db = ById('edit_table_db').value
    let tb = ById('edit_table_old_table').value
    let key = ById('edit_table_modal_key').value
    getRows(db, tb, key)
})


async function getDbsApi() {
    let d = await fetch('/home', {method: 'get'})
    const res = await d.json()

    ById('create_database_form').style.display = "flex"

    //render dbs
    let displayer = ById('display')
    displayer.innerHTML = ''
    let container = createNode('div')
    container.classList.add('flex', 'flex-wrap', 'gap-3')

    // sidebar
    let sb = ById('sidebar')
    sb.innerHTML = ''
    let hh = createNode('h3')
    hh.innerText = 'Databases'
    hh.classList.add('uppercase', 'font-bold', 'text-2xl', 'mb-3', 'text-slate-700')
    displayer.append(hh)

    res.forEach((item, i) => {
        let element = createNode('div')
        element.classList.add('p-7', 'bg-white', 'border', 'border-slate-300', 'rounded-lg', 'min-w-[300px]', 'cursor-pointer')

        let pb = createNode('h4')
        pb.innerText = item['Database']
        let pa = createNode('p')
        pa.innerText = "Tables: " + item['table_count']
        pb.classList.add('font-bold')
        pa.classList.add('text-xs', 'uppercase', 'text-blue-600')

        element.append(pb)
        element.append(pa)
        element.addEventListener('click', (e) => getTables(e, item['Database'], i))

        container.append(element)

        // sidebar
        let sb_container = createNode('div')
        sb_container.classList.add('side_container')
        let sb_wrap = createNode('div')
        sb_wrap.classList.add('side_wrapper')

        let sb_drop = createNode('div')
        sb_drop.classList.add('border', 'border-slate-400', 'rounded-lg', 'cursor-pointer', 'bg-white', 'px-3', 'py-2')
        sb_drop.innerText = '+'

        let sb_p = createNode('p')
        sb_p.classList.add('db_listed','border', 'border-slate-400', 'rounded-lg', 'py-2', 'ps-4', 'w-full', 'bg-white', 'cursor-pointer')
        sb_p.id = "db_" + i
        sb_p.innerText = item['Database']
        sb_p.addEventListener('click', (e) => getTables(e, item['Database'], i))

        let sb_kids = createNode('div')
        sb_kids.classList.add('table_listed')
        sb_kids.id = 'tables_' + i

        sb_wrap.append(sb_drop)
        sb_wrap.append(sb_p)
        sb_container.append(sb_wrap)
        sb_container.append(sb_kids)
        sb.append(sb_container)

        sb_drop.addEventListener('click', (e) => {
            sidebarDropDownClicked(e, i, item['Database'])
        })

    })
    displayer.append(container)
}



ById('save_table_name').addEventListener('click', async (e) => {
    e.preventDefault()
    let dd = new FormData()
    dd.append('db', ById('edit_table_db').value)
    dd.append('name', ById('edit_table_table').value)
    dd.append('old_name', ById('edit_table_old_table').value)

    let data = await fetch('/table/rename', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: dd})
    let res = await data.json()

    if (data.status == 200) {
        ById('edit_table_error').innerText = "Name update Successfully!"
        ById('edit_table_error').style.color = "green"
        ById('edit_table_error').style.display = "flex"

        setTimeout(() => {

            ById('edit_table_error').style.display = "none"
            ById('edit_table_modal').style.display = "none"
            getRows(ById('edit_table_db').value, ById('edit_table_table').value, ById('edit_table_modal_key').value)
        }
            , 1000)

    } else {
        ById('edit_table_error').innerText = res
        ById('edit_table_error').style.color = "red"
        ById('edit_table_error').style.display = "flex"
    }
})

//Utils
function ById(id) {
    return document.getElementById(id)
}
function createNode(tag) {
    return document.createElement(tag)
}
