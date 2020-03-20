import utils from './utils';
import db from './firestore';

utils.log('성공적으로 설치되었습니다!');

function init() {
  let vc = Entry.variableContainer;
  let perfix = vc.getVariableByName('계란말이'); // 계란말이 변수의 Prefix
  if (!perfix) return utils.log('이 작품은 계란말이를 사용하지 않습니다!');
  else perfix = perfix.getValue();
  utils.log(`이 작품은 '${perfix}'(으)로 시작하는 변수를 계란말이 변수로 사용합니다.`);

  const gyelanVars = [
    ...vc.variables_
      .filter((d) => d.name_.startsWith(perfix)),
    ...vc.lists_
      .filter((d) => d.name_.startsWith(perfix)),
  ]
  utils.log('이 작품은 다음 변수/리스트들을 계란말이 변수로 사용하고 있어요: ', gyelanVars.map((d) => d.name_).join(', '))
  
  let projectRef = db.collection('project').doc(Entry.projectId);

  function subscribe(ref) {
    return ref.onSnapshot((doc) => { // firebase 정보가 변경되었을 때 엔트리 변수 동기화.
      var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
      const data = doc.data();
      utils.log(source, "의 데이터가 다음과 같이 변경 됨: ", data);
      for (const key in data) {
        let vari = _.find(gyelanVars, { id_: key });
        if (vari.type == 'variable') vari.setValue(data[key], false);
        else vari.setArray(data[key], false);
      }
    }, (error) => {
      utils.error('스냅샷 리스너를 연결하던 중 에러가 발생함.', error)
    });
  }

  let unsubscribe = null;
  Entry.addEventListener('run', () => {
    unsubscribe = subscribe(projectRef); // 작품 실행 시 동기화 켜기
    utils.log('변수 동기화 시작');
  })
  Entry.addEventListener('stop', () => { // 작품 종료 시 동기화 끄기
    unsubscribe();
    utils.log('변수 동기화 종료');
  })

  // 변수 값 변경 시 자동으로 서버에 반영되도록 prototype 수정
  Entry.Variable.prototype.setValue = function (value, sync = true) {
    if (sync && _.find(gyelanVars, { id_: this.id_ })) {
      projectRef.update({
        [this.id_]: value
      })
    }
    // original code
    if (!this.isRealTime_) {
      this.value_ = value;
      this._valueWidth = null;
      this.updateView();
      Entry.requestUpdateTwice = true;
    } else {
      return new Promise(async (resolve, reject) => {
        try {
          await this.cloudVariable.set(
            {
              variableType: this.type,
              id: this.id_,
            },
            value
          );
          this.value_ = value;
          this._valueWidth = null;
          this.updateView();
          Entry.requestUpdateTwice = true;
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }
  }
  if (vc.lists_.length !== 0) { // 리스트가 있다면
    let proto = Object.getPrototypeOf(vc.lists_[0]); // 리스트의 prototype 가져와서 수정
    proto.appendValue = function (value) {
      if (!this.isRealTime_) {
        if (!this.array_) {
          this.array_ = [];
        }
        this.array_.push({
          data: value,
        });
        if (_.find(gyelanVars, { id_: this.id_ })) {
          projectRef.update({
            [this.id_]: this.array_
          })
        }
        this.updateView();
      } else {
        return new Promise(async (resolve, reject) => {
          try {
            const target = {
              variableType: this.type,
              id: this.id_,
            };
            await this.cloudVariable.append(target, value);
            const list = this.cloudVariable.get(target);
            if (list) {
              this.array_ = list.array;
            } else {
              this.array_.push({
                data: value,
              });
            }
            this.updateView();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    }
    proto.deleteValue = function (index) {
      if (!this.isRealTime_) {
        this.array_.splice(index - 1, 1);
        if (_.find(gyelanVars, { id_: this.id_ })) {
          projectRef.update({
            [this.id_]: this.array_
          })
        }
        this.updateView();
      } else {
        return new Promise(async (resolve, reject) => {
          try {
            const target = {
              variableType: this.type,
              id: this.id_,
            };
            await this.cloudVariable.delete(target, index - 1);
            const list = this.cloudVariable.get(target);
            if (list) {
              this.array_ = list.array;
            } else {
              this.array_.splice(index - 1, 1);
            }
            this.updateView();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    }
    proto.insertValue = function (index, data) {
      if (!this.isRealTime_) {
        this.array_.splice(index - 1, 0, { data });
        if (_.find(gyelanVars, { id_: this.id_ })) {
          projectRef.update({
            [this.id_]: this.array_
          })
        }
        this.updateView();
      } else {
        return new Promise(async (resolve, reject) => {
          try {
            const target = {
              variableType: this.type,
              id: this.id_,
            };
            await this.cloudVariable.insert(target, index - 1, data);
            const list = this.cloudVariable.get(target);
            if (list) {
              this.array_ = list.array;
            } else {
              this.array_.splice(index - 1, 0, { data });
            }
            this.updateView();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    }
    proto.replaceValue = function (index, data) {
      if (!this.isRealTime_) {
        this.array_[index - 1].data = data;
        if (_.find(gyelanVars, { id_: this.id_ })) {
          projectRef.update({
            [this.id_]: this.array_
          })
        }
        this.updateView();
      } else {
        return new Promise(async (resolve, reject) => {
          try {
            const target = {
              variableType: this.type,
              id: this.id_,
            };
            await this.cloudVariable.replace(target, index - 1, data);
            const list = this.cloudVariable.get(target);
            if (list) {
              this.array_ = list.array;
            } else {
              this.array_[index - 1].data = data;
            }
            this.updateView();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }
    }
  }
}

init();