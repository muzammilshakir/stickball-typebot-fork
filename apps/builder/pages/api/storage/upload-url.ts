import { withSentry } from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { badRequest, generatePresignedUrl, methodNotAllowed } from 'utils'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'GET') {
    const session = await getSession({ req })
    if (!session) {
      res.status(401)
      return
    }

    if (
      !process.env.S3_ENDPOINT ||
      !process.env.S3_ACCESS_KEY ||
      !process.env.S3_SECRET_KEY
    )
      return badRequest(
        res,
        'S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY'
      )
    const filePath = req.query.filePath as string | undefined
    const fileType = req.query.fileType as string | undefined
    if (!filePath || !fileType) return badRequest(res)
    const presignedUrl = generatePresignedUrl({ fileType, filePath }) //

    return res.status(200).send({ presignedUrl })
  }
  return methodNotAllowed(res)
}

export default withSentry(handler)
