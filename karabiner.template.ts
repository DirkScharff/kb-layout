import { TextWriter } from '@yellicode/core'
import { Generator } from '@yellicode/templating'
import _ from 'lodash'

Generator.generateFromModel({ outputFile: './output.json' }, (writer: TextWriter, model: any) => {
    console.log(model)

    let manipulators = []
    if (model.layers) {
        const { def, ...other } = model.layers
        if (def) {
            Object.entries(def).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                    v.map((e) => {
                        if (typeof e === 'object') {
                            switch (e.type) {
                                case 'activate_layer': {
                                    manipulators.push({
                                        from: {
                                            key_code: k,
                                        },
                                        to: [
                                            {
                                                set_variable: {
                                                    name: `${e.layer}_activated`,
                                                    value: 1,
                                                },
                                            },
                                        ],
                                        to_after_key_up: [
                                            {
                                                set_variable: {
                                                    name: `${e.layer}_activated`,
                                                    value: 0,
                                                },
                                            },
                                        ],
                                        type:'basic'
                                    })
                                }
                            }
                        }
                    })
                }
            })
        }

        Object.entries(other).forEach(([layer, entry])=>{
            Object.entries(entry).forEach(([key, value]) => {
                manipulators.push({
                    conditions:[
                        {
                            name: `${layer}_activated`,
                            type: 'variable_if',
                            value: 1
                        }
                    ],
                    from:{
                        key_code: key
                    },
                    to:[
                        {
                            key_code: value
                        }
                    ],
                    type:'basic'
                })
            })
        })

    }

    let config = {
        description: model.description,
        manipulators,
    }

    writer.write(JSON.stringify(config, null, 2))
})
