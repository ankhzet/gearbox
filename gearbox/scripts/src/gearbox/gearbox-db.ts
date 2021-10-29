import { DB, DataStore } from '../core';

export { ModelStore, SyncResult } from '../core';

export class GearboxDB extends DB {
    constructor() {
        super();
        this.scheme('plugins', (blueprint) => {
            void blueprint.index({ fieldName: 'uid', unique: true });
        });
    }

    get plugins(): DataStore {
        return this.tables['plugins'];
    }
}

// (GearBox) => {
//
// 	return class Plugin extends GearBox.Plugin {
//
// 		constructor(...args) {
// 			super(...args);
//
// 			this.on('ACTION', (event, context) => {
// 				context.execute(this, function (sandbox) {
// 					sandbox.unmount();
//
// 					class Finder {
//
// 						constructor(document) {
// 							this.document = document;
// 						}
//
// 						find(search) {
// 							let walker = (node) => {
// 								if (!node.innerText) {
// 									if (node.textContent && (node.textContent.indexOf(search) >= 0))
// 										return node;
//
// 									return false;
// 								}
//
// 								if (node.innerText.indexOf(search) < 0)
// 									return false;
//
// 								for (let child, i = 0; i < node.childNodes.length; i++)
// 									if (child = walker(node.childNodes[i]))
// 										return child;
//
// 								return node;
// 							};
//
// 							return walker(this.document.getElementsByTagName('BODY')[0]);
// 						}
//
// 						show(search) {
// 							let found = this.find(search);
// 							let parent = found.parentElement;
// 							let substitution = this.document.createElement('SPAN');
// 							substitution.innerHTML = found.textContent.replace(search, `<span style="background-color: red; color: white;">${search}</span>`);
//
// 							parent.replaceChild(substitution, found);
//
// 							substitution.scrollIntoView();
// 						}
//
// 					}
//
// 					(new Finder(sandbox.dom)).show('#');
// 				});
// 			});
// 		}

// 	}
//
// }
