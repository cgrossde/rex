// language=HTML
import {Page} from "./Profile.js";

const template = `
    <div>
        <table class="table">
            <thead>
            <tr>
                <th>Active</th>
                <th>Regex</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="page in currentProfile.pages">
                <td><input v-model="page.active" type="checkbox"/></td>
                <td><input v-model="page.regEx" type="text" placeholder="RegEx to match agains URL"/></td>
                <td><button class="btn btn-danger btn-xs" @click="currentProfile.removePage(page)"><i class="glyphicon glyphicon-trash"></i></button></td>
            </tr>
            </tbody>
        </table>
        <button class="btn btn-sm btn-primary" @click="addPage">Add</button>
    </div>
`

export default Vue.component('pages-edit', {
  template,
  props: ['currentProfile'],
  methods: {
    addPage() {
      this.currentProfile.pages.push(new Page())
    }
  }
})