
/**

This Module does the following;

1. get tables
2. color the right db
3. create header
4. create main section
5. handle create table
6. handle edit table
7. hadle delete table

 **/

async function getTables(e, name, key) {
    let res = await fetch(`/data/tables?database=${name}`, {method: "get"})
    if (res.status == 200) {
        let tables = await res.json()
        colorSideBarDB(key)
        createHeader(name)
        createMainSection(tables, name)
    } else {
        return 0
    }
}
function colorSideBarDB(key) {
    ById('create_database_form').style.display = "none"

    let sidebar_dbs = document.getElementsByClassName('db_listed')
    for (let i = 0; i < sidebar_dbs.length; i++) {
        sidebar_dbs[i].style.backgroundColor = "white"
    }

    ById('db_' + key).style.backgroundColor = "#bbf7d0"
}

function createHeader(db_name) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerHTML = `TABLES in the <span class='text-blue-700'>${db_name}</span> Database`
    divs.append(header)

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Table'
    create_t_btn.type = 'button'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')
    create_t_btn.addEventListener('click', e => {
        createTable(db_name)
    })


    let rename_btn = createNode('button')
    rename_btn.innerText = 'Rename Database'
    rename_btn.type = 'button'
    rename_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    rename_btn.addEventListener('click', async e => {
        renameDatabase(db_name)
    })

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Database'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    delete_db_btn.addEventListener('click', async e => {
        e.preventDefault()
        deleteDatabase(db_name)
    })

    let h_btn_cont = createNode('div')
    h_btn_cont.classList.add('flex', 'gap-3', 'items-center')
    h_btn_cont.append(create_t_btn)
    h_btn_cont.append(rename_btn)
    h_btn_cont.append(delete_db_btn)
    divs.append(h_btn_cont)
    displayer.append(divs)
}

function createMainSection(data, db_name) {
    if (data.length < 1) {
        let error = createNode('p')
        let text = "The Database " + db_name + " Has No Tables"
        error.innerText = text
        error.classList.add('text-xl', 'my-4', 'text-orange-500')
        displayer.append(error)
    } else {
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
                const d = await fetch(`/data?db=${db_name}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                const res = await d.json()
                renderRowsTable(res.data, res.columns, db_name, Object.values(data[i])[0], key, res.columns_full)
            })


            let da = new FormData()
            da.append('table', Object.values(data[i])[0])
            da.append('database', db_name)

            del_btn.addEventListener('click', async (e) => {
                let dt = await fetch('/delete/table', {
                    method: "POST", body: da,
                    headers: {
                        'X-CSRF-TOKEN': token
                    },
                })
                if (dt.status == 200) {
                    getTables(e, db_name, key)
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
                    const d = await fetch(`/data?db=${db_name}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                    const res = await d.json()
                    renderRowsTable(res.data, res.columns, db_name, Object.values(data[i])[0], key, res.columns_full)
                })

                each_table.append(td)
            }

            each_table.append(btn_cont)
            tables_cont.append(each_table)
        }
        displayer.append(tables_cont)
    }
}


function createTable(database) {
    ById('create_table_modal').style.display = 'flex'
    ById('create_table_db').value = database
    ById('create_table_title').innerText = 'Create a new table in the ' + database + " database"

    ById('create_table_modal').addEventListener('submit', async e => {
        e.preventDefault()
        let data = new FormData(e.target)
        let res = await fetch('/create/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: data})
        if (res.status == 200) {
            ById('create_table_modal').style.display = 'none'
            ById('create_table_error').style.display = 'none'
            getTables(e, e.target.db.value, key)
        } else {
            ById('create_table_error').style.display = 'flex'
            ById('create_table_error').innerText = await res.json()
        }
    })
}


async function deleleTable(database, table) {
    let data = new FormData()
    data.append('database', database)
    data.append('table', table)

    let res = await fetch('/delete/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: data})
    if (res.status == 200) {
        getTables(e, database, key)
    } else {
        let body = await res.json();
        let global_error = ById('global_error')
        global_error.style.display = 'flex'
        global_error.innerText = body
        setTimeout(() => {
            global_error.style.display = 'none'
            global_error.innerText = ''
        }, 5000)
    }
}


function editTable(database, table, key) {
    ById('edit_table_modal_container').style.display = 'flex'
    let edit_tab = ById('edit_table_modal')
    edit_tab.style.display = 'flex'

    let keyi = createNode('input')
    keyi.value = key
    keyi.hidden = 'true'
    keyi.name = 'key'
    keyi.id = 'edit_table_modal_key'
    edit_tab.append(keyi)

    let col_cont = edit_tab.querySelector('#all_edit_columns')
    col_cont.innerHTML = ''


    edit_tab.querySelector('input[name="name"]').value = table
    edit_tab.querySelector('input[name="old_name"]').value = table
    edit_tab.querySelector('input[name="db"]').value = database

    let mode = ById('edit_each_column')

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
        saver.classList.add('p-2', 'cursor-pointer', 'rounded-lg', 'bg-green-300', 'text-slate-800')
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
        deleter.classList.add('p-2', 'cursor-pointer', 'rounded-lg', 'bg-rose-300', 'text-slate-800')
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
            ById('edit_table_modal_container').style.display = "none"
            getRows(ById('edit_table_db').value, ById('edit_table_table').value, ById('edit_table_modal_key').value)
        }
            , 1000)

    } else {
        ById('edit_table_error').innerText = res
        ById('edit_table_error').style.color = "red"
        ById('edit_table_error').style.display = "flex"
    }
})

//edit table, add colums
let model = ById('edit_each_column')
let add_col = ById('add_column_on_edit')

add_col.addEventListener('click', h => {
    let new_mode = model.cloneNode(true)
    new_mode.classList.add('cloned')
    new_mode.style.display = 'flex'

    let bt = createNode('button')
    bt.classList.add('p-2', 'cursor-pointer', 'rounded-lg', 'bg-green-300', 'text-slate-800')
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
    btt.classList.add('p-2', 'cursor-pointer', 'rounded-lg', 'bg-red-300', 'text-slate-800')
    btt.innerText = 'Delete'
    btt.type = 'button'

    new_mode.append(bt)
    new_mode.append(btt)

    ById('all_edit_columns').append(new_mode)

    btt.addEventListener('click', d => {
        d.target.parentNode.remove()
    })
})
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
    ById('edit_table_modal_container').style.display = 'none'
    // ById('edit_table_error').style.display = 'none'
    ById('edit_table_modal').removeEventListener('submit', () => {return })
    ById('all_edit_columns').innerHTML = ''

    let db = ById('edit_table_db').value
    let tb = ById('edit_table_old_table').value
    let key = ById('edit_table_modal_key').value
    getRows(db, tb, key)
})
