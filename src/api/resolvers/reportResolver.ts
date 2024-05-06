import {Report} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import reportModel from '../models/reportModel';
import quizModel from '../models/quizModel';
import {escape} from 'validator';
import {errors} from '../../functions/errors';

const reportResolver = {
  Mutation: {
    reportAdd: async (
      _parent: undefined,
      args: {target: string; message: string},
      context: MyContext,
    ): Promise<Report> => {
      const message = escape(args.message);
      if (!context.userdata) throw errors.authUser;
      const quizTarget = await quizModel.findById(args.target);
      if (!quizTarget) throw errors.notFound;
      const report = reportModel.create({
        target: quizTarget.id,
        source: context.userdata.user._id,
        message: message,
      });
      if (!report) throw errors.notCreated;
      return report;
    },
  },
};

export default reportResolver;
