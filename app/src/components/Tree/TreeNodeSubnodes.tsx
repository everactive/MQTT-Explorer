import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import TreeNode from './TreeNode'
import { TopicOrder } from '../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core'
import { TopicViewModel } from '../../TopicViewModel'

export interface Props {
  animateChanges: boolean
  treeNode: q.TreeNode<TopicViewModel>
  filter?: string
  collapsed?: boolean | undefined
  classes: any
  lastUpdate: number
  topicOrder: TopicOrder
  selectedTopic?: q.TreeNode<TopicViewModel>
  autoExpandLimit: number
  didSelectTopic: any
  highlightTopicUpdates: boolean
  selectTopicWithMouseOver: boolean
}

interface State {
  alreadyAdded: number
}

class TreeNodeSubnodes extends React.Component<Props, State> {
  private renderMoreAnimationFrame?: any
  constructor(props: Props) {
    super(props)
    this.state = { alreadyAdded: 10 }
  }

  private sortedNodes(): Array<q.TreeNode<TopicViewModel>> {
    const { topicOrder, treeNode } = this.props

    let edges = treeNode.edgeArray
    if (topicOrder === TopicOrder.abc) {
      edges = edges.sort((a, b) => a.name.localeCompare(b.name))
    }

    let nodes = edges.map(edge => edge.target)
    if (topicOrder === TopicOrder.messages) {
      nodes = nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
    }
    if (topicOrder === TopicOrder.topics) {
      nodes = nodes.sort((a, b) => b.childTopicCount() - a.childTopicCount())
    }

    return nodes
  }

  private renderMore() {
    this.renderMoreAnimationFrame = (window as any).requestIdleCallback(() => {
      this.setState({ ...this.state, alreadyAdded: this.state.alreadyAdded * 1.5 })
    }, { timeout: 500 })
  }

  public componentWillUnmount() {
    (window as any).cancelIdleCallback(this.renderMoreAnimationFrame)
  }

  public render() {
    const edges = this.props.treeNode.edgeArray
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    if (this.state.alreadyAdded < edges.length) {
      this.renderMore()
    }

    const nodes = this.sortedNodes().slice(0, this.state.alreadyAdded)
    const listItems = nodes.map((node) => {
      return (
        <TreeNode
          key={`${node.hash()}-${this.props.filter}`}
          animateChages={this.props.animateChanges}
          treeNode={node}
          className={this.props.classes.listItem}
          topicOrder={this.props.topicOrder}
          autoExpandLimit={this.props.autoExpandLimit}
          lastUpdate={node.lastUpdate}
          didSelectTopic={this.props.didSelectTopic}
          highlightTopicUpdates={this.props.highlightTopicUpdates}
          selectTopicWithMouseOver={this.props.selectTopicWithMouseOver}
        />
      )
    })

    return (
      <span className={this.props.classes.list}>
        {listItems}
      </span>
    )
  }
}

const styles = (theme: Theme) => ({
  list: {
    display: 'block' as 'block',
    clear: 'both' as 'both',
  },
  listItem: {
    padding: `0px 0px 0px ${theme.spacing(1)}`,
  },
})

export default withStyles(styles)(TreeNodeSubnodes)
