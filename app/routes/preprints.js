import Ember from 'ember';
import config from 'ember-get-config';

export default Ember.Route.extend({
    model(params) {
        return Ember.RSVP.hash({
            id: params.file_id,
            baseUrl: config.OSF.url,
            renderUrl: config.OSF.renderUrl,

            preprint: this.store.findRecord('preprint', params.file_id),
            supplement: [{name: 'first.txt', links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'howdy.docx', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/6kf7d/providers/osfstorage/57a393b9da3e2401ee2ab1e2"}}, {name:'hiya.pdf', kind: "folder"}, {name: 'wuzzup.jpg', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'wuddup.txt', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'greetings.txt', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'sup.txt', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'RENAMED', links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'howdy.docx', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/6kf7d/providers/osfstorage/57a393b9da3e2401ee2ab1e2"}}, {name:'hiya.pdf', kind: "folder"}, {name: 'wuzzup.jpg', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'wuddup.txt', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'greetings.txt', kind: "file", links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}, {name: 'PRIMARYFILE', links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}}],
            primary: {name: 'PRIMARYFILE', links:{download: "https://test-files.osf.io/v1/resources/qudgr/providers/osfstorage/57a379cbda3e24004afba2d5"}},
//            project: this.store.findRecord('preprint', params.file_id).then(preprint =>
//                this.store.findRecord('file', preprint.get('path')).then(file => file.get('links').download.split('/')[5])),
//            downloadLink: this.store.findRecord('preprint', params.file_id).then(preprint =>
//                this.store.findRecord('file', preprint.get('path')).then(file => file.get('links').download))
        });
    }
});

