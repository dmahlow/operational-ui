import { IReadOnlyState, State, TPath } from "./state"
import { IAccessors, IChartStateObject, IObject, TStateWriter } from "./typings"
import { isEmpty, reduce } from "lodash/fp"

interface IChartState<T> {
  current: State<T>
  previous: State<T>
}

export interface IChartStateReadOnly<T> {
  current: IReadOnlyState<T>
  previous: IReadOnlyState<T>
}

class StateHandler<IConfig> {
  state: IChartState<IChartStateObject>

  constructor(obj: IChartStateObject) {
    const initial = new State<IChartStateObject>(obj)
    this.state = { current: initial, previous: initial.clone() }
  }

  captureState() {
    this.state.previous.set(["computed"], this.state.current.clone().get("computed"))
  }

  readOnly(): IChartStateReadOnly<IChartStateObject> {
    return {
      current: this.state.current.readOnly(),
      previous: this.state.previous.readOnly(),
    }
  }

  // Data
  data(data?: any) {
    if (!arguments.length) return this.state.current.get("data")
    return this.state.current.set("data", data)
  }

  hasData(): boolean {
    return isEmpty(this.data())
  }

  // Config
  config(config?: Partial<IConfig>): IConfig {
    if (!arguments.length) return this.state.current.get("config")
    return this.state.current.merge("config", config)
  }

  // Accessors
  accessors(type: string, accessors?: IObject): IAccessors {
    if (!accessors) return this.state.current.get(["accessors", type])
    const accessorFuncs: any = reduce.convert({ cap: false })((memo: IObject, accessor: any, key: string) => {
      memo[key] = typeof accessor === "function" ? accessor : () => accessor
      return memo
    }, {})(accessors)
    return this.state.current.merge(["accessors", type], accessorFuncs)
  }

  // Computed
  computedWriter(namespace: TPath): TStateWriter {
    this.state.current.set(["computed"].concat(namespace), {})
    return (path: TPath, value: any): void => {
      this.state.current.set(["computed"].concat(namespace).concat(path), value)
    }
  }
}

export default StateHandler
