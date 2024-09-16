
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
        el.classList.remove('text-green', 'active')
        el.innerText = "+"
        ById(`tables_${key}`).style.display = 'none'
    } else {
        el.classList.add('text-green', 'active')
        el.innerText = "-"
        ById(`tables_${key}`).style.display = 'flex'
        let p = ById(`tables_${key}`)

        let dd = await fetch(`/data/tables?database=${name}`, {method: "get"})
        let data = await dd.json()
        p.innerHTML = ''

        for (let i = 0; i < data.length; i++) {
            let d = createNode('div')
            d.id = key + "_" + i
            d.classList.add("side_tables")
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
        listed[i].style.backgroundColor = ""
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#86efac"

    let bc_tb = document.getElementsByClassName('bc_tb')
    for (let i = 0; i < bc_tb.length; i++) {
        bc_tb[i].remove();
    }

    let displayer = ById('display')
    displayer.innerHTML = ''
    let mydb = name

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'tables_header')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerText = "Tables in the " + mydb + " Database;"
    divs.append(header)

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Table'
    create_t_btn.type = 'button'
    create_t_btn.style.backgroundColor = '#86efac'
    create_t_btn.style.color = '#1e293b'

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

    divs.append(create_t_btn)

    let rename_btn = createNode('button')
    rename_btn.innerText = 'Rename Database'
    rename_btn.type = 'button'
    rename_btn.style.backgroundColor = '#94a3b8'

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
    delete_db_btn.style.backgroundColor = '#ec4899'

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

    divs.append(rename_btn)
    divs.append(delete_db_btn)
    displayer.append(divs)

    let table = createNode('table')
    let table_h = createNode('thead')
    let table_b = createNode('tbody')

    let th_edit = createNode("th")
    th_edit.innerText = "Edit"
    let th_delete = createNode("th")
    th_delete.innerText = "Delete"

    let th = createNode("th")
    th.innerText = "Tables"
    table_h.append(th)

    for (let i = 0; i < data.length; i++) {
        let tr = createNode("tr")
        tr.id = "tr_" + key + "_" + i

        let td_view = createNode("td")
        let view_btn = createNode('button')
        view_btn.innerText = 'View'
        td_view.append(view_btn)

        let td_delete = createNode("td")
        let del_btn = createNode('button')
        del_btn.classList.add('remove_row')
        del_btn.innerText = 'Delete'

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

        td_delete.append(del_btn)

        for (let b in data[i]) {
            let td = createNode("td")
            td.innerText = data[i][b]
            tr.append(td)
        }

        tr.append(td_view)
        tr.append(td_delete)

        table_b.append(tr)
    }

    table.append(table_h)
    table.append(table_b)
    displayer.append(table)

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
        listed[i].style.backgroundColor = ""
    }

    let db_clicked = ById('db_' + key)
    db_clicked.style.backgroundColor = "#86efac"

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'tables_header')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerText = "Rows of the " + tb + " table"
    divs.append(header)


    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Row'
    create_t_btn.style.backgroundColor = '#86efac'
    create_t_btn.style.color = '#1e293b'
    create_t_btn.type = 'button'

    create_t_btn.addEventListener('click', e => {
        ById('create_row_modal').style.display = 'flex'
    })

    divs.append(create_t_btn)

    let edit_table_btn = createNode('button')
    edit_table_btn.innerText = 'Edit Table'
    edit_table_btn.style.backgroundColor = '#94a3b8'
    edit_table_btn.style.color = '#f1f5f9'
    edit_table_btn.type = 'button'

    let edit_tab = ById('edit_table_modal')
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
            deleter.classList.add('border', 'p-2', 'cursor-pointer')
            deleter.style.backgroundColor = 'tomato'
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

    divs.append(edit_table_btn)

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Table'
    delete_db_btn.type = 'button'
    delete_db_btn.style.backgroundColor = '#ec4899'

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

    divs.append(delete_db_btn)
    displayer.append(divs)

    let table = createNode('table')
    let table_h = createNode('thead')
    let table_b = createNode('tbody')

    for (let i in colu) {
        let th = createNode("th")
        th.innerText = i
        table_h.append(th)
    }

    for (let i = 0; i < data.length; i++) {
        let tr = createNode("tr")

        let td_edit = createNode("td")
        let edit_btn = createNode('button')
        edit_btn.innerText = 'Edit'
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

            // populate data
            // modify
        })

        let td_delete = createNode("td")
        let del_btn = createNode('button')
        del_btn.innerText = 'Delete'
        del_btn.style.backgroundColor = 'black'

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

        for (let b in data[i]) {
            let td = createNode("td")
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

    res.forEach((item, i) => {
        let element = createNode('div')
        element.classList.add('db_card')
        element.innerText = item['Database']

        let pa = createNode('p')
        let pb = createNode('p')
        pa.innerText = "Tables: " + item['table_count']

        element.append(pa)
        element.addEventListener('click', (e) => getTables(e, item['Database'], i))

        container.append(element)

        // sidebar
        let sb_container = createNode('div')
        sb_container.classList.add('side_container')
        let sb_wrap = createNode('div')
        sb_wrap.classList.add('side_wrapper')

        let sb_drop = createNode('div')
        sb_drop.classList.add('side_drop')
        sb_drop.innerText = '+'

        let sb_p = createNode('p')
        sb_p.classList.add('db_listed')
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

        setTimeout(() => ById('edit_table_error').style.display = "none"
            , 4000)
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
