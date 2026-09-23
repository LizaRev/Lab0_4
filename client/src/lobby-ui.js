export function createLobbyUI(lobby) {
  const container = document.createElement('div');

  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '1000';

  container.style.backgroundImage = `
    linear-gradient(
      rgba(100, 75, 150, 0.28),
      rgba(80, 55, 130, 0.38)
    ),
    url("/api/background.jpg")
  `;

  container.style.backgroundSize = 'cover';
  container.style.backgroundPosition = 'center';
  container.style.backgroundRepeat = 'no-repeat';

  container.style.color = '#29233d';

  container.style.fontFamily =
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const card = document.createElement('div');

  card.style.position = 'relative';
  card.style.zIndex = '2';

  card.style.width = 'min(520px, 90vw)';
  card.style.maxHeight = '90vh';
  card.style.overflowY = 'auto';

  card.style.padding = '42px';

  card.style.boxSizing = 'border-box';

  card.style.background =
    'rgba(255, 255, 255, 0.78)';

  card.style.backdropFilter =
    'blur(24px)';

  card.style.webkitBackdropFilter =
    'blur(24px)';

  card.style.border =
    '1px solid rgba(255, 255, 255, 0.9)';

  card.style.borderRadius =
    '28px';

  card.style.boxShadow =
    '0 25px 70px rgba(55, 40, 100, 0.35)';

  container.appendChild(card);

  const smallTitle =
    document.createElement('div');

  smallTitle.textContent =
    'SPACE ARENA';

  smallTitle.style.textAlign =
    'center';

  smallTitle.style.fontSize =
    '12px';

  smallTitle.style.fontWeight =
    '700';

  smallTitle.style.letterSpacing =
    '4px';

  smallTitle.style.color =
    '#8b72c9';

  smallTitle.style.marginBottom =
    '8px';

  card.appendChild(
    smallTitle
  );

  const title =
    document.createElement('h1');

  title.textContent =
    'Choose your arena';

  title.style.margin = '0';

  title.style.textAlign =
    'center';

  title.style.fontSize =
    '32px';

  title.style.fontWeight =
    '800';

  title.style.letterSpacing =
    '-1px';

  title.style.color =
    '#30264a';

  card.appendChild(
    title
  );

  const subtitle =
    document.createElement('p');

  subtitle.textContent =
    'Enter your name and choose a room to start playing.';

  subtitle.style.textAlign =
    'center';

  subtitle.style.color =
    '#756b89';

  subtitle.style.fontSize =
    '14px';

  subtitle.style.margin =
    '10px 0 30px';

  card.appendChild(
    subtitle
  );

  const nameLabel =
    document.createElement('label');

  nameLabel.textContent =
    'PLAYER NAME';

  nameLabel.style.display =
    'block';

  nameLabel.style.fontSize =
    '11px';

  nameLabel.style.fontWeight =
    '700';

  nameLabel.style.letterSpacing =
    '1.5px';

  nameLabel.style.color =
    '#756b89';

  nameLabel.style.marginBottom =
    '8px';

  card.appendChild(
    nameLabel
  );

  const nameInput =
    document.createElement('input');

  nameInput.type = 'text';

  nameInput.placeholder =
    'Enter your name';

  nameInput.maxLength = 20;

  nameInput.style.width =
    '100%';

  nameInput.style.boxSizing =
    'border-box';

  nameInput.style.padding =
    '14px 16px';

  nameInput.style.border =
    '1px solid #ddd4ef';

  nameInput.style.borderRadius =
    '14px';

  nameInput.style.background =
    'rgba(255, 255, 255, 0.85)';

  nameInput.style.color =
    '#30264a';

  nameInput.style.fontSize =
    '15px';

  nameInput.style.outline =
    'none';

  nameInput.style.transition =
    'all 0.2s ease';

  nameInput.addEventListener(
    'focus',
    () => {

      nameInput.style.border =
        '1px solid #a78bdf';

      nameInput.style.boxShadow =
        '0 0 0 4px rgba(167, 139, 223, 0.15)';

    }
  );

  nameInput.addEventListener(
    'blur',
    () => {

      nameInput.style.border =
        '1px solid #ddd4ef';

      nameInput.style.boxShadow =
        'none';

    }
  );

  card.appendChild(
    nameInput
  );

  const roomsTitle =
    document.createElement('div');

  roomsTitle.textContent =
    'AVAILABLE ROOMS';

  roomsTitle.style.marginTop =
    '28px';

  roomsTitle.style.marginBottom =
    '12px';

  roomsTitle.style.fontSize =
    '11px';

  roomsTitle.style.fontWeight =
    '700';

  roomsTitle.style.letterSpacing =
    '1.5px';

  roomsTitle.style.color =
    '#756b89';

  card.appendChild(
    roomsTitle
  );

  const roomsContainer =
    document.createElement('div');

  roomsContainer.style.display =
    'flex';

  roomsContainer.style.flexDirection =
    'column';

  roomsContainer.style.gap =
    '10px';

  card.appendChild(
    roomsContainer
  );

  const joinButton =
    document.createElement('button');

  joinButton.textContent =
    'JOIN ARENA  →';

  joinButton.disabled = true;

  joinButton.style.width =
    '100%';

  joinButton.style.marginTop =
    '24px';

  joinButton.style.padding =
    '15px';

  joinButton.style.border =
    'none';

  joinButton.style.borderRadius =
    '14px';

  joinButton.style.fontSize =
    '14px';

  joinButton.style.fontWeight =
    '700';

  joinButton.style.letterSpacing =
    '0.5px';

  joinButton.style.cursor =
    'pointer';

  joinButton.style.transition =
    'all 0.2s ease';

  function updateJoinButton() {

    const enabled =
      Boolean(
        nameInput.value.trim() &&
        selectedRoomId
      );

    joinButton.disabled =
      !enabled;

    if (enabled) {

      joinButton.style.background =
        'linear-gradient(135deg, #9b7bd3, #7654b8)';

      joinButton.style.color =
        'white';

      joinButton.style.boxShadow =
        '0 8px 20px rgba(118, 84, 184, 0.28)';

    } else {

      joinButton.style.background =
        '#e4dff0';

      joinButton.style.color =
        '#a29aaf';

      joinButton.style.boxShadow =
        'none';

    }

  }

  joinButton.addEventListener(
    'mouseenter',
    () => {

      if (!joinButton.disabled) {

        joinButton.style.transform =
          'translateY(-2px)';

        joinButton.style.boxShadow =
          '0 12px 25px rgba(118, 84, 184, 0.35)';

      }

    }
  );

  joinButton.addEventListener(
    'mouseleave',
    () => {

      joinButton.style.transform =
        'translateY(0)';

      updateJoinButton();

    }
  );

  card.appendChild(
    joinButton
  );

  const status =
    document.createElement('p');

  status.textContent =
    'Loading rooms...';

  status.style.textAlign =
    'center';

  status.style.fontSize =
    '12px';

  status.style.color =
    '#8b8198';

  status.style.marginTop =
    '16px';

  card.appendChild(
    status
  );

  let selectedRoomId = null;

  function renderRooms(rooms) {

    roomsContainer.innerHTML =
      '';

    selectedRoomId = null;

    updateJoinButton();

    if (
      !rooms ||
      rooms.length === 0
    ) {

      status.textContent =
        'No rooms available';

      return;

    }

    status.textContent =
      'Select an arena';

    for (const room of rooms) {

      const roomButton =
        document.createElement('button');

      roomButton.style.width =
        '100%';

      roomButton.style.boxSizing =
        'border-box';

      roomButton.style.padding =
        '15px 16px';

      roomButton.style.border =
        '1px solid #e1d9ef';

      roomButton.style.borderRadius =
        '16px';

      roomButton.style.background =
        'rgba(255, 255, 255, 0.65)';

      roomButton.style.color =
        '#30264a';

      roomButton.style.textAlign =
        'left';

      roomButton.style.cursor =
        'pointer';

      roomButton.style.transition =
        'all 0.2s ease';

      const roomTop =
        document.createElement('div');

      roomTop.style.display =
        'flex';

      roomTop.style.alignItems =
        'center';

      const roomName =
        document.createElement('span');

      roomName.textContent =
        room.name;

      roomName.style.fontSize =
        '15px';

      roomName.style.fontWeight =
        '700';

      roomTop.appendChild(
        roomName
      );

      roomButton.appendChild(
        roomTop
      );

      const roomDescription =
        document.createElement('div');

      roomDescription.textContent =
        'Ready to join';

      roomDescription.style.fontSize =
        '11px';

      roomDescription.style.marginTop =
        '5px';

      roomDescription.style.color =
        '#91879e';

      roomButton.appendChild(
        roomDescription
      );

      roomButton.addEventListener(
        'mouseenter',
        () => {

          if (
            selectedRoomId !== room.id
          ) {

            roomButton.style.background =
              'rgba(245, 240, 255, 0.95)';

            roomButton.style.border =
              '1px solid #c7b3ed';

            roomButton.style.transform =
              'translateY(-1px)';

          }

        }
      );

      roomButton.addEventListener(
        'mouseleave',
        () => {

          if (
            selectedRoomId !== room.id
          ) {

            roomButton.style.background =
              'rgba(255, 255, 255, 0.65)';

            roomButton.style.border =
              '1px solid #e1d9ef';

            roomButton.style.transform =
              'translateY(0)';

          }

        }
      );

      roomButton.addEventListener(
        'click',
        () => {

          selectedRoomId =
            room.id;

          for (
            const otherButton
              of roomsContainer.children
          ) {

            otherButton.style.background =
              'rgba(255, 255, 255, 0.65)';

            otherButton.style.border =
              '1px solid #e1d9ef';

            otherButton.style.boxShadow =
              'none';

            otherButton.style.transform =
              'translateY(0)';

          }

          roomButton.style.background =
            'linear-gradient(135deg, #eee7ff, #e2d8fa)';

          roomButton.style.border =
            '2px solid #a78bdf';

          roomButton.style.boxShadow =
            '0 6px 18px rgba(118, 84, 184, 0.15)';

          status.textContent =
            `${room.name} selected`;

          updateJoinButton();

        }
      );

      roomsContainer.appendChild(
        roomButton
      );

    }

  }

  nameInput.addEventListener(
    'input',
    () => {

      lobby.setPlayerName(
        nameInput.value
      );

      updateJoinButton();

    }
  );

  joinButton.addEventListener(
    'click',
    () => {

      if (!selectedRoomId) {
        return;
      }

      lobby.setPlayerName(
        nameInput.value
      );

      lobby.join(
        selectedRoomId
      );

    }
  );

  lobby.addEventListener(
    'roomsUpdated',
    (event) => {

      renderRooms(
        event.detail.rooms
      );

    }
  );

  lobby.addEventListener(
    'joined',
    () => {

      container.remove();

    }
  );

  document.body.appendChild(
    container
  );

  lobby.startAutoRefresh();

  return {

    element:
      container,

    destroy() {

      lobby.stopAutoRefresh();

      container.remove();

    }

  };

}