import Modal from 'components/common/Modal';
import ChangePasswordForm from 'components/auth/ChangePasswordForm';

export default function SettingsModal({ onClose }) {
  return (
    <Modal title="Change password" onClose={onClose}>
      <p className="settings-modal-desc">
        Update your login password. Your username stays the same.
      </p>
      <ChangePasswordForm onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}

