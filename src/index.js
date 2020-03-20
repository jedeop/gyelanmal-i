import utils from './utils';
import db from './firestore';

utils.log('설치 됨!');

let projectRef = db.collection('project').doc(Entry.projectId);

projectRef.set({
  'n0f6': Math.random().toFixed(3)
}, { merge: true })
.then(() => {
  utils.log("문서를 저장하는데 성공함");
})
.catch((error) => {
  utils.error("문서를 저장하는 중 에러가 발생함: ", error);
});

db.collection('project').get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      utils.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
  })