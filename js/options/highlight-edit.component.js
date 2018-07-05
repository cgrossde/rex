import {regexHighlight} from "../content/regexHighlighter.js"
import {Highlight} from "./Profile.js";

// language=HTML
const template = `
    <div class="row">
        <div class="col-md-8">
            <table class="table">
                <thead>
                <tr>
                    <th>Active</th>
                    <th>Regex</th>
                    <th>Color</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="highlight in currentProfile.highlight">
                    <td><input @change="updateSandboxText" v-model="highlight.active" type="checkbox"/></td>
                    <td>
                        <span class="text-muted">/</span>
                        <input @input="updateSandboxText" v-model="highlight.regEx" type="text"
                               placeholder="RegEx to highlight"/>
                        <span class="text-muted">/gim</span>
                    </td>
                    <td><input @change="updateSandboxText" v-model="highlight.color" type="color"/></td>
                    <td>
                        <button class="btn btn-danger btn-xs"
                                @click="currentProfile.removeHighlight(highlight); updateSandboxText()"><i
                                class="glyphicon glyphicon-trash"></i></button>
                    </td>
                </tr>
                </tbody>
            </table>
            <button class="btn btn-sm btn-primary" @click="addHighlight">Add</button>
        </div>
        <!-- SANDBOX for testing -->
        <div class="col-md-4">
            <div class="panel panel-default">
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
`

export default Vue.component('highlight-edit', {
  template,
  data: function () {
    return {
      editSandbox: false,
      sandboxText: 'Lorem ipsum dolor sid amed.'
    }
  },
  props: ['currentProfile'],
  methods: {
    addHighlight() {
      this.currentProfile.highlight.push(new Highlight())
    },
    showSandboxInput() {
      this.editSandbox = true
      Vue.nextTick(() => {
        this.$refs.sandboxInput.focus()
      })
    },
    updateSandboxText() {
      // Reset
      this.$refs.sandboxText.innerHTML = this.sandboxText
      // Highlight
      regexHighlight(this.currentProfile.highlight, this.$refs.sandboxText)
    },
    hideSandboxInput() {
      this.editSandbox = false
      Vue.nextTick(this.updateSandboxText.bind(this))
    }
  }
})