import {Page} from "./Profile.js";

// language=HTML
const template = `
    <div>
        <div class="row">
            <div class="col-md-6">
                <h3>Active on URLs
                    <button class="btn btn-sm btn-primary pull-right" @click="addPage">
                        <i class="glyphicon glyphicon-plus"/>&nbsp;Add
                    </button>
                </h3>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <table class="table">
                    <thead>
                    <tr>
                        <th>Enabled</th>
                        <th>Regex</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="page in currentProfile.pages">
                        <td><input v-model="page.active" type="checkbox"/></td>
                        <td>
                            <span class="text-muted">/</span>
                            <input v-model="page.regEx" @input="validateUrl" type="text"
                                   placeholder="RegEx to match agains URL"/>
                            <span class="text-muted">/gim</span>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-xs" @click="currentProfile.removePage(page)">
                                <i class="glyphicon glyphicon-trash"></i></button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <!-- SANDBOX for testing -->
            <div class="col-md-6">
                <div class="panel panel-default">
                    <div class="panel-heading"><h4 class="panel-title">Test URL</h4></div>
                    <div class="panel-body">
                        <div class="form-group" v-bind:class="{'has-success': urlValid, 'has-error': !urlValid}"
                             style="margin-bottom: 0">
                            <input placeholder="URL" class="form-control" v-model="dummyUrl" @input="validateUrl"/>
                            <span v-if="urlValid" class="text-success">Active</span>
                            <span v-if="!urlValid" class="text-danger">Inactive</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`

export default Vue.component('pages-edit', {
  template,
  props: ['currentProfile'],
  data: function () {
    return {
      urlValid: false,
      dummyUrl: ''
    }
  },
  updated() {
    this.validateUrl()
  },
  mounted() {
    this.validateUrl()
  },
  methods: {
    addPage() {
      this.currentProfile.pages.push(new Page())
    },
    validateUrl() {
      this.urlValid = this.currentProfile.isActive(this.dummyUrl)
    }
  }
})