import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Link,
  makeStyles,
  Typography,
  Chip,
  Box,
  Button,
  CircularProgress,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  getStructureName,
  getStructFile,
  getSourceReference,
  getStructureDisplayName,
} from '../../helpers';
import { STRUCTKIT_DOCS_URL } from '../../constants';

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  content: {
    paddingTop: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  chip: {
    marginTop: theme.spacing(1),
  },
  validateButton: {
    marginTop: theme.spacing(2),
  },
  validationResult: {
    marginTop: theme.spacing(2),
  },
}));

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  message?: string;
}

export const StructKitCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const config = useApi(configApiRef);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const structureName = getStructureName(entity);
  const structFile = getStructFile(entity);
  const sourceReference = getSourceReference(entity);
  const displayName = getStructureDisplayName(entity);

  const backendUrl = config.getOptionalString('backend.baseUrl') || '';

  const handleValidate = async () => {
    setValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch(`${backendUrl}/api/structkit/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structure: structureName,
          structFile: structFile,
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: error instanceof Error ? error.message : 'Validation failed',
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Card className={classes.card}>
      <CardHeader
        title="StructKit"
        subheader="Generated structure information"
        action={
          <IconButton
            component="a"
            href={STRUCTKIT_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="StructKit Documentation"
          >
            <OpenInNewIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent className={classes.content}>
        <Box className={classes.section}>
          <Typography variant="body2" color="textSecondary">
            <span className={classes.label}>Structure:</span>
            {displayName}
          </Typography>
          {structureName && (
            <Chip
              label={`Named: ${structureName}`}
              size="small"
              color="primary"
              className={classes.chip}
            />
          )}
          {structFile && (
            <Chip
              label={`File: ${structFile}`}
              size="small"
              color="default"
              className={classes.chip}
            />
          )}
        </Box>

        {sourceReference && (
          <Box className={classes.section}>
            <Typography variant="body2" color="textSecondary">
              <span className={classes.label}>Source:</span>
              {sourceReference}
            </Typography>
          </Box>
        )}

        <Box className={classes.section}>
          <Typography variant="body2" color="textSecondary">
            <span className={classes.label}>Documentation:</span>
            <Link
              href={STRUCTKIT_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              structkit.dev
            </Link>
          </Typography>
        </Box>

        <Divider />

        <Box className={classes.validateButton}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleValidate}
            disabled={validating}
            startIcon={validating ? <CircularProgress size={20} /> : undefined}
          >
            {validating ? 'Validating...' : 'Validate Structure'}
          </Button>
        </Box>

        {validationResult && (
          <Box className={classes.validationResult}>
            {validationResult.valid ? (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Structure is valid
              </Alert>
            ) : (
              <Alert severity="error" icon={<ErrorIcon />}>
                <Typography variant="body2">
                  {validationResult.message || 'Structure validation failed'}
                </Typography>
                {validationResult.errors && validationResult.errors.length > 0 && (
                  <ul>
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
