import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Field,
  Input,
  Textarea,
  Text,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { CreatePrototypeRequest, GitHubRepository } from '../../types/prototype';
import { usePrototypes } from '../../hooks/usePrototypes';
import { useGitHubAuth } from '../../hooks/useGitHubAuth';
import GitHubAuthButton from '../github/GitHubAuthButton';

const useStyles = makeStyles({
  dialogContent: {
    width: '480px',
    maxWidth: '90vw',
  },
  section: {
    marginBottom: tokens.spacingVerticalL,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalS,
    display: 'block',
  },
  sectionDescription: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalM,
    lineHeight: tokens.lineHeightBase300,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    marginTop: tokens.spacingVerticalXS,
  },
  successText: {
    color: tokens.colorPaletteGreenForeground1,
    fontSize: tokens.fontSizeBase200,
    marginTop: tokens.spacingVerticalXS,
  },
  validatedRepo: {
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalS,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
});

interface AddPrototypeDialogProps {
  onSuccess?: () => void;
}

const AddPrototypeDialog: React.FC<AddPrototypeDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [validatedRepo, setValidatedRepo] = useState<GitHubRepository | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { createPrototype } = usePrototypes();
  const { isAuthenticated, validateRepository } = useGitHubAuth();
  const styles = useStyles();

  const resetForm = () => {
    setName('');
    setDescription('');
    setRepoUrl('');
    setValidatedRepo(null);
    setValidationError(null);
    setIsValidating(false);
    setIsCreating(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleRepoUrlChange = (value: string) => {
    setRepoUrl(value);
    setValidatedRepo(null);
    setValidationError(null);
  };

  const validateRepo = async () => {
    if (!repoUrl.trim()) {
      setValidationError('Please enter a repository URL');
      return;
    }

    if (!isAuthenticated) {
      setValidationError('Please authenticate with GitHub first');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const repo = await validateRepository(repoUrl);
      setValidatedRepo(repo);
      
      // Auto-fill name if not already set
      if (!name.trim()) {
        setName(repo.name);
      }
      
      // Auto-fill description if not already set and repo has one
      if (!description.trim() && repo.description) {
        setDescription(repo.description);
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to validate repository');
      setValidatedRepo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreate = async () => {
    if (!validatedRepo || !name.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const request: CreatePrototypeRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        gitHubRepoUrl: validatedRepo.htmlUrl,
      };

      await createPrototype(request);
      
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Failed to create prototype');
    } finally {
      setIsCreating(false);
    }
  };

  const canCreate = validatedRepo && name.trim() && !isCreating;

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="primary"
          size="large"
          icon={<Add24Regular />}
        >
          Add Prototype
        </Button>
      </DialogTrigger>
      
      <DialogSurface className={styles.dialogContent}>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={<Dismiss24Regular />}
                />
              </DialogTrigger>
            }
          >
            Add New Prototype
          </DialogTitle>
          
          <DialogContent>
            {/* GitHub Authentication Section */}
            <div className={styles.section}>
              <Text className={styles.sectionTitle}>1. Connect to GitHub</Text>
              <Text className={styles.sectionDescription}>
                Authenticate with GitHub to access your repositories and enable automatic builds.
              </Text>
              <GitHubAuthButton 
                onAuthSuccess={() => {}} 
                size="medium"
                appearance="outline"
              />
            </div>

            {/* Repository Selection Section */}
            <div className={styles.section}>
              <Text className={styles.sectionTitle}>2. Select Repository</Text>
              <Text className={styles.sectionDescription}>
                Enter the GitHub repository URL for your React or static site project.
              </Text>
              
              <Field label="GitHub Repository URL" required>
                <Input
                  value={repoUrl}
                  onChange={(_, data) => handleRepoUrlChange(data.value)}
                  placeholder="https://github.com/username/repository"
                  disabled={!isAuthenticated}
                />
              </Field>
              
              <Button
                appearance="outline"
                onClick={validateRepo}
                disabled={!isAuthenticated || !repoUrl.trim() || isValidating}
                style={{ marginTop: tokens.spacingVerticalS }}
              >
                {isValidating ? 'Validating...' : 'Validate Repository'}
              </Button>

              {isValidating && (
                <div className={styles.loadingContainer}>
                  <Spinner size="tiny" />
                  <Text>Checking repository access...</Text>
                </div>
              )}

              {validationError && (
                <Text className={styles.errorText}>{validationError}</Text>
              )}

              {validatedRepo && (
                <div className={styles.validatedRepo}>
                  <Text weight="semibold">{validatedRepo.fullName}</Text>
                  {validatedRepo.description && (
                    <Text style={{ display: 'block', marginTop: tokens.spacingVerticalXS }}>
                      {validatedRepo.description}
                    </Text>
                  )}
                  <Text className={styles.successText}>✓ Repository validated</Text>
                </div>
              )}
            </div>

            {/* Prototype Details Section */}
            {validatedRepo && (
              <div className={styles.section}>
                <Text className={styles.sectionTitle}>3. Prototype Details</Text>
                <Text className={styles.sectionDescription}>
                  Customize how your prototype appears in the gallery.
                </Text>
                
                <Field label="Prototype Name" required>
                  <Input
                    value={name}
                    onChange={(_, data) => setName(data.value)}
                    placeholder="My Awesome Prototype"
                  />
                </Field>

                <Field label="Description" style={{ marginTop: tokens.spacingVerticalM }}>
                  <Textarea
                    value={description}
                    onChange={(_, data) => setDescription(data.value)}
                    placeholder="Brief description of what this prototype demonstrates..."
                    rows={3}
                  />
                </Field>
              </div>
            )}
          </DialogContent>
          
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel</Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              onClick={handleCreate}
              disabled={!canCreate}
            >
              {isCreating ? 'Creating...' : 'Create Prototype'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default AddPrototypeDialog;