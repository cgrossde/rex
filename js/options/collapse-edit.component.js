import {Collapse} from './Profile.js';
import {collapseText} from '../content/collapseText.js';

// language=HTML
const template = `
    <div>
        <div class="row">
            <div class="col-md-6">
                <h3>Collapse text
                    <button class="btn btn-sm btn-primary pull-right" @click="addCollapse">
                        <i class="glyphicon glyphicon-plus"/>&nbsp;Add
                    </button>
                </h3>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10">
                <table class="table">
                    <thead>
                    <tr>
                        <th>Enabled</th>
                        <th>Title</th>
                        <th>Start RegEx</th>
                        <th>Stop RegEx</th>
                        <th>Color</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="collapse in currentProfile.collapse">
                        <td><input v-model="collapse.active" type="checkbox"/></td>
                        <td>
                            <input v-model="collapse.title" type="text" placeholder="Title"/>
                        </td>
                        <td>
                            <span class="text-muted">/</span>
                            <input v-model="collapse.startRegEx" type="text" placeholder="Start regEx"/>
                            <span class="text-muted">/gi</span>
                        </td>
                        <td>
                            <span class="text-muted">/</span>
                            <input v-model="collapse.stopRegEx" type="text" placeholder="Stop regEx"/>
                            <span class="text-muted">/gi</span>
                        </td>
                        <td><input v-model="collapse.color" type="color"/></td>
                        <td>
                            <button class="btn btn-danger btn-xs" @click="currentProfile.removeCollapse(collapse)">
                                <i class="glyphicon glyphicon-trash"></i></button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="row">
            <!-- SANDBOX for testing -->
            <div class="col-md-12">
                <div class="panel panel-default hidden">
                    <div class="panel-heading"><h4 class="panel-title">Preview</h4></div>
                    <div class="panel-body">
                        <div v-if="!editSandbox" ref="sandboxText" @click="showSandboxInput">
                            {{sandboxText}}
                        </div>
                        <small v-if="!editSandbox" @click="showSandboxInput">(Click to edit)</small>
                        <textarea v-if="editSandbox"
                                  v-model="sandboxText"
                                  v-on:blur="hideSandboxInput"
                                  ref="sandboxInput"
                                  style="width: 100%"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
`

export default Vue.component('collapse-edit', {
  template,
  props: ['currentProfile'],
  data: function () {
    return {
      editSandbox: false,
      sandboxText: sandboxDummyText
    }
  },
  mounted() {
    this.updateSandboxText()
  },
  updated() {
    this.updateSandboxText()
  },
  methods: {
    addCollapse() {
      this.currentProfile.collapse.push(new Collapse())
    },
    showSandboxInput() {
      if (event.target.classList.contains("hc-collapse-header"))
        return
      this.editSandbox = true
      Vue.nextTick(() => {
        this.$refs.sandboxInput.focus()
      })
    },
    updateSandboxText() {
      // Reset
      this.$refs.sandboxText.innerHTML = this.sandboxText
      // Collapse
      this.currentProfile.collapse.forEach(collapseConfig => collapseText(collapseConfig, this.$refs.sandboxText))
    }
    ,
    hideSandboxInput(event) {
      this.editSandbox = false
      Vue.nextTick(this.updateSandboxText.bind(this))
    }
  }
})

const sandboxDummyText = `start
Lorem ipsum dolor sid amed
stop`