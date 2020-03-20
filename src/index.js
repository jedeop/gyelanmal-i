import utils from './utils';
import db from './firestore';

utils.log('성공적으로 설치되었습니다!');

function init() {
  let vc = Entry.variableContainer;
  let perfix = vc.getVariableByName('계란말이'); // 계란말이 변수의 Prefix
  if (!perfix) return utils.log('이 작품은 계란말이를 사용하지 않습니다!');
  else perfix = perfix.getValue();
  utils.log(`이 작품은 '${perfix}'(으)로 시작하는 변수를 계란말이 변수로 사용합니다.`);

  let gyelanVars = [
    ...vc.variables_
      .filter((d) => d.name_.startsWith(perfix)),
    ...vc.lists_
      .filter((d) => d.name_.startsWith(perfix)),
  ]
  utils.log('이 작품은 다음 변수/리스트들을 계란말이 변수로 사용하고 있어요: ', gyelanVars.map((d) => d.name_).join(', '))
  
  let projectRef = db.collection('project').doc(Entry.projectId);
  projectRef.onSnapshot((doc) => { // firebase 정보가 변경되었을 때 엔트리 변수 동기화.
      var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      const data = doc.data();
      utils.log(source, "의 데이터가 다음과 같이 변경 됨: ", data);
      for (const key in data) {
        let vari = _.find(gyelanVars, {id_: key});
        if (vari.type == 'variable') vari.setValue(data[key]);
        else vari.setArray(data[key]);
      }
    });

}

init();