import React, { Component } from 'react';
import { connect } from 'react-redux'
import { View, FlatList } from 'react-native';
import Deck from '../components/Deck';
import FABContainer from '../components/FABContainer';
import FAB from '../components/FAB';
import ConfirmDialog from '../components/ConfirmDialog';
import MainToolbar from '../components/MainToolbar';
import { fetchDecks, deleteDeck } from '../actions';

export class Main extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: <MainToolbar
                handleSearchPress={() => navigation.navigate('DeckSearch')}
              />
    };
  };

  state = {
    confirmRemoveDialogVisible: false,
    currentDeck: null
  }

  componentDidMount() {
    const { fetchDecks } = this.props;

    fetchDecks();
  }

  openConfirmRemoveDialog = deckId => this.setState({ confirmRemoveDialogVisible: true, currentDeck: deckId });
  closeConfirmRemoveDialog = () => this.setState({ confirmRemoveDialogVisible: false, currentDeck: null });

  renderItem = ({ item }) => {
    return (
      <Deck
        title={item.title}
        flashcardsCount={item.questions.length}
        handleEditPress={
          () => this.props.navigation.navigate('EditDeck', { deckId: item.id })
        }
        handleDeletePress={() => this.openConfirmRemoveDialog(item.id)}
      />
    );
  }

  render() {
    const {
      decks,
      deleteDeck
    } = this.props;

    const {
      confirmRemoveDialogVisible,
      formVisible,
      currentDeck
    } = this.state;

    return (
      <View style={{flex: 1}}>
        <FlatList
          data={decks}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
        <FABContainer>
          <FAB
            handlePress={() => this.props.navigation.navigate('CreateDeck')}
          />
        </FABContainer>
        <ConfirmDialog
          visible={confirmRemoveDialogVisible}
          handleDismiss={() => this.closeConfirmRemoveDialog()}
          handleSubmitPress={() => {this.closeConfirmRemoveDialog(); deleteDeck(currentDeck);}}
          title="Delete deck?"
          content="This deck and all it cards will be deleted. You can edit this deck if you want to change something."
          actionSubmitText="Delete"
        />
      </View>
    );
  }
}

const mapStateToProps = ({ decks }) => ({ decks: Object.values(decks) });

const mapDispatchToProps = dispatch => ({
  fetchDecks: () => dispatch(fetchDecks()),
  deleteDeck: id => dispatch(deleteDeck(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(Main);
