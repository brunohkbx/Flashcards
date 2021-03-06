import React from 'react';
import { shallow } from 'enzyme';
import { Main } from './Main';
import * as notificationUtil from '../../lib/notifications';

describe('Main', () => {
  const setup = propOverrides => {
    const defaultProps = Object.assign({
      decks: [
        {
          title: 'React',
          questions: [
            {
              question: 'What is React?',
              answer: 'A library for managing user interfaces'
            }
          ],
          id: '259162c6-8c55-446b-aa4f-cf9a6fcffc2f'
        }
      ],
      createDeck: jest.fn(),
      fetchDecks: jest.fn(),
      deleteDeck: jest.fn(),
      loadSettings: jest.fn(),
      navigation: {
        navigate: jest.fn(),
        getParam: jest.fn(),
        setParams: jest.fn()
      },
      settings: {
        receiveNotifications: false
      }
    }, propOverrides);

    const wrapper = shallow(<Main {...defaultProps} />);
    const wrapperInstance = wrapper.instance();

    const dismissConfirmDialog = () => {
      wrapper
        .find('ConfirmDialog')
        .dive()
        .simulate('dismiss');
    };

    const cancelConfirmDialog = () => {
      wrapper
        .find('ConfirmDialog')
        .dive()
        .find('DialogActions')
        .childAt(0)
        .simulate('press');
    };

    const submitConfirmDialog = () => {
      wrapper
        .find('ConfirmDialog')
        .dive()
        .find('DialogActions')
        .childAt(1)
        .simulate('press');
    };

    const dismissSnackbar = () => {
      wrapper.find('withTheme(Snackbar)').simulate('dismiss');
    };

    return {
      defaultProps,
      wrapper,
      wrapperInstance,
      dismissConfirmDialog,
      cancelConfirmDialog,
      submitConfirmDialog,
      dismissSnackbar
    };
  };

  it('renders properly', () => {
    const { wrapper } = setup();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders properly when there are not any decks', () => {
    const { wrapper } = setup({ decks: [] });

    expect(wrapper).toMatchSnapshot();
  });

  describe('componentDidMount', () => {
    it('fetches all the decks', () => {
      const mockFetchDecks = jest.fn();

      setup({ fetchDecks: mockFetchDecks });

      expect(mockFetchDecks).toHaveBeenCalled();
    });

    it('loads the settings', () => {
      const mockLoadSettings = jest.fn();

      setup({ loadSettings: mockLoadSettings });

      expect(mockLoadSettings).toHaveBeenCalled();
    });

    it('sets openSettingsDialog as navigation params', () => {
      const mockNavigation = { setParams: jest.fn() };
      const { wrapperInstance } = setup({ navigation: mockNavigation });

      expect(mockNavigation.setParams).toHaveBeenCalledWith(
        { openSettingsDialog: wrapperInstance.openSettingsDialog}
      );
    });
  });

  describe('componentDidUpdate', () => {
    it('displays the snackbar if there is a flashMessage as navigation param', () => {
      const { wrapper, wrapperInstance } = setup();
      const mockNavigation = { getParam: jest.fn(() => 'foo') };
      jest.spyOn(wrapperInstance, 'setState');
      wrapperInstance.toaster = { showMessage: jest.fn() };

      wrapper.setProps({ navigation: mockNavigation });

      expect(
        wrapperInstance.setState
      ).toHaveBeenCalledWith({ snackbarVisible: true }, expect.any(Function));
      expect(wrapperInstance.toaster.showMessage).toHaveBeenCalledWith('foo');
    });

    it('does not display the snackbar if there is not a flashMessage as navigation param', () => {
      const { wrapper, wrapperInstance } = setup();
      const mockNavigation = { getParam: jest.fn(() => undefined) };
      jest.spyOn(wrapperInstance, 'setState');

      wrapper.setProps({ navigation: mockNavigation });

      expect(wrapperInstance.setState).not.toHaveBeenCalled();
    });

    describe('notifications', () => {
      it('calls scheduleLocalNotification when receiveNotifications transacts from false to true', () => {
        const { wrapper } = setup({ settings: { receiveNotifications: false }});
        jest.spyOn(notificationUtil, 'scheduleLocalNotification');

        wrapper.setProps({ settings: { receiveNotifications: true }});

        expect(notificationUtil.scheduleLocalNotification).toHaveBeenCalled();
      });

      it('calls clearLocalNotification when receiveNotifications transacts from true to false', () => {
        const { wrapper } = setup({ settings: { receiveNotifications: true }});
        jest.spyOn(notificationUtil, 'clearLocalNotification');

        wrapper.setProps({ settings: { receiveNotifications: false }});

        expect(notificationUtil.clearLocalNotification).toHaveBeenCalled();
      });
    });
  });

  describe('openDialog', () => {
    it('sets the state correctly', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.openDialog('1');

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        {
          dialogVisible: true,
          selectedDeck: {
            ...wrapperInstance.state.selectedDeck,
            id: '1'
          }
        }
      );
    });
  });

  describe('closeDialog', () => {
    it('sets the state correctly', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.closeDialog();

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        {
          dialogVisible: false,
          selectedDeck: {
            ...wrapperInstance.state.selectedDeck,
            id: null
          }
        }
      );
    });
  });

  describe('submitDialog', () => {
    it('sets the state correctly', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.submitDialog();

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        {
          dialogVisible: false,
          selectedDeck: {
            ...wrapperInstance.state.selectedDeck,
            remove: true
          }
        }
      );
    });
  });

  describe('openSettingsDialog', () => {
    it('sets settingsDialogVisible to true', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.openSettingsDialog();

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        {
          settingsDialogVisible: true,
        }
      );
    });
  });

  describe('closeSettingsDialog', () => {
    it('sets settingsDialogVisible to false', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.closeSettingsDialog();

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        {
          settingsDialogVisible: false,
        }
      );
    });
  });

  describe('addToasterRef', () => {
    it('assigns a ref to this.toaster', () => {
      const mockToaster = jest.fn();
      const { wrapperInstance } = setup();

      wrapperInstance.addToasterRef(mockToaster);

      expect(wrapperInstance.toaster).toEqual(mockToaster);
    });
  });

  describe('closeSnackbar', () => {
    it('sets the state correctly', () => {
      const { wrapperInstance } = setup();
      jest.spyOn(wrapperInstance, 'setState');

      wrapperInstance.closeSnackbar();

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        { snackbarVisible: false }
      );
    });
  });

  describe('handleDeckDelete', () => {
    it('calls deleteDeck with the given deck id', () => {
      const mockDeleteDeck = jest.fn(() => Promise.resolve());
      const { wrapperInstance } = setup({ deleteDeck: mockDeleteDeck });

      wrapperInstance.handleDeckDelete('1');

      expect(mockDeleteDeck).toHaveBeenCalledWith('1');
    });

    it('resets selectedDeck and displays snackbar', async () => {
      const mockDeleteDeck = jest.fn(() => Promise.resolve());
      const { wrapperInstance } = setup({ deleteDeck: mockDeleteDeck });
      jest.spyOn(wrapperInstance, 'setState');
      wrapperInstance.toaster = { showMessage: jest.fn() };

      await wrapperInstance.handleDeckDelete('1');

      expect(wrapperInstance.setState).toHaveBeenCalledWith(
        { selectedDeck: { id: null, remove: false },
          snackbarVisible: true
        },
        expect.any(Function)
      );
      expect(
        wrapperInstance.toaster.showMessage
      ).toHaveBeenCalledWith('Deck has been successfully deleted');
    });
  });

  describe('renderItem', () => {
    describe('When there is a deck to be removed', () => {
      it('fades the deck', () => {
        const { wrapper, wrapperInstance } = setup();
        const item = { item: { title: 'foo', questions: [], id: 1}};
        wrapper.setState({ selectedDeck: { id: 1, remove: true }});

        expect(wrapperInstance.renderItem(item)).toMatchSnapshot();
      });
    });

    it('renders correctly', () => {
      const { wrapperInstance } = setup();
      const item = { item: { title: 'foo', questions: [] }};

      expect(wrapperInstance.renderItem(item)).toMatchSnapshot();
    });

    it('redirects to DeckDetail screen when the deck is clicked', () => {
      const mockNavigate = jest.fn();
      const { wrapperInstance } = setup();
      wrapperInstance.props.navigation.navigate = mockNavigate;
      const item = { item: { title: 'foo', id: '123', questions: [] }};
      const deckWrapper = wrapperInstance.renderItem(item);

      shallow(deckWrapper)
        .find('Deck')
        .dive()
        .find('TouchableOpacity')
        .simulate('press');

      expect(mockNavigate).toHaveBeenCalledWith(
        'DeckDetail',
        { deckId: '123' }
      );
    });
  });

  describe('Movable', () => {
    it('changes toValue when snackbar is visible', () => {
      const { wrapper } = setup();

      wrapper.setState({ snackBarVisible: true });

      expect(wrapper).toMatchSnapshot();
    });
  });
});
