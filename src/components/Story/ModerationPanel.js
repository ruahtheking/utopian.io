import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, FormattedMessage, FormattedRelative, FormattedDate, FormattedTime } from 'react-intl';
import { Link } from 'react-router-dom';
import { Tag, Icon, Popover, Tooltip } from 'antd';
import * as ReactIcon from 'react-icons/lib/md'; 
import { find } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Lightbox from 'react-image-lightbox';
import { formatter } from 'steem';
import {
    getComments,
    getCommentsList,
    getCommentsPendingVotes,
    getIsAuthenticated,
    getAuthenticatedUserName,
} from '../../reducers';
import { getContribution } from '../../actions/contribution';
import Body from './Body';
import StoryFooter from '../StoryFooter/StoryFooter';
import Avatar from '../Avatar';
import Topic from '../Button/Topic';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import Action from '../../components/Button/Action';
import CommentForm from '../Comments/CommentForm';
import Comments from "../Comments/Comments";
import BanUser from '../../components/BanUser';
import './StoryFull.less';

@connect(
    state => ({
      authenticated: getIsAuthenticated(state),
    }), 
    {
      sendComment: (parentPost, body, isUpdating, originalPost) =>
        commentsActions.sendComment(parentPost, body, isUpdating, originalPost),
      notify, 
      getContribution
    }
  ) 
  // @connect(
  //   state=>({}),
  // 
  // )
@injectIntl
class StoryFull extends React.Component {

render() {

    return (
        <span>
        {!reviewed || alreadyChecked ? <div className="StoryFull__review">
        {!alreadyChecked ? <h3>
          <Icon type="safety" /> {!isModerator ? 'Under Review' : 'Review Contribution'}<br/>
        </h3> : null}
  
        {!isModerator ? <p>
          A moderator will review this contribution within 24-48 hours and suggest changes if necessary. This is to ensure the quality of the contributions and promote collaboration inside Utopian.
              {isAuthor ? ' Check the comments often to see if a moderator is requesting for some changes. ' : null}
        </p> : null}
  
        {isModerator && !alreadyChecked ? <p>
          Hello Moderator. How are you today? <br />
          Please make sure this contribution meets the{' '}<Link to="/rules">Utopian Quality Standards</Link>.<br />
        </p> : null}
  
        {isModerator && alreadyChecked ? <div>
          <h3><center><Icon type="safety" /> Moderation Control </center></h3>
          {this.state.moderation.reviewed && <p><b>Status: &nbsp;</b> <Icon type="check-circle"/>&nbsp; Accepted <span className="smallBr"><br /></span> <b>Moderated By: &nbsp;</b> <Link className="StoryFull__modlink" to={`/@${this.state.moderation.moderator}`}>@{this.state.moderation.moderator}</Link></p>}
          {this.state.moderation.flagged && <p><b>Status: &nbsp;</b> <Icon type="exclamation-circle"/>&nbsp; Hidden <span className="smallBr"><br /></span> <b>Moderated By: &nbsp;</b> <Link className="StoryFull__modlink" to={`/@${this.state.moderation.moderator}`}>@{this.state.moderation.moderator}</Link></p>}
          {this.state.moderation.pending && <p><b>Status: &nbsp;</b> <Icon type="sync"/>&nbsp; Pending <span className="smallBr"><br/></span> <b>Moderated By: &nbsp;</b> <Link className="StoryFull__modlink" to={`/@${this.state.moderation.moderator}`}>@{this.state.moderation.moderator}</Link></p>}
          {this.state.moderation.reserved && <p><b>Status: &nbsp;</b> <Icon type="sync"/>&nbsp; Reserved <span className="smallBr"><br/></span> <b>Moderated By: &nbsp;</b> <Link className="StoryFull__modlink" to={`/@${this.state.moderation.moderator}`}>@{this.state.moderation.moderator}</Link></p>}
        </div> : null}
  
        {isModerator ? <div>
          {!this.state.moderation.flagged && <Action
            id="hide"
            primary={true}
            text='Hide forever'
            onClick={() => {
              var confirm = window.confirm('Are you sure? Flagging should be done only if this is spam or if the user has not been this.state.moderationponding for over 48 hours to your requests.')
              if (confirm) {
                moderatorAction(post.author, post.permlink, user.name, 'flagged').then(() => {
                  this.setState({ reviewsource: 1 })
                  this.setModTemplateByName("flaggedDefault");
                  this.setState({ moderatorCommentModal: true })
                });
              }
            }}
          />}
          {!this.state.moderation.pending && !this.state.moderation.reviewed && <Action
            id="pending"
            primary={true}
            text='Pending'
            onClick={() => {
              moderatorAction(post.author, post.permlink, user.name, 'pending');
              this.setModTemplateByName("pendingDefault");
              this.setState({ moderatorCommentModal: true })
            }}
          />}
  
          {!this.state.moderation.reviewed && <Action
            id="verified"
            primary={true}
            text='Verify'
            onClick={() => this.setState({ verifyModal: true })}
          />}
  
          {!this.state.moderation.reviewed && !this.state.moderation.pending && !this.state.moderation.flagged && !this.state.moderation.reserved && <Action
            id="reserved"
            primary={true}
            text='Reserve'
            onClick={() => {
              moderatorAction(post.author, post.permlink, user.name, 'reserved');
              this.state.moderation.reserved = true;
              reviewPanel();
            }}
            />
          }
  
          {!this.state.moderation.reviewed && <span className="floatRight"><BanUser intl={intl} user={post.author}/>&nbsp;&nbsp;</span>}
          </div> : null}
          </div> : null}
          <Modal
          visible={this.state.verifyModal}
          title='Does this contribution meet the Utopian Standards?'
          okText='Yes, Verify'
          cancelText='Not yet'
          onCancel={() => {
            var confirm = window.confirm("Would you like to set this post as Pending Review instead?")
            if (confirm) {
              this.setState({ reviewsource: 2 })
              this.setModTemplateByName("pendingDefault");
              this.setState({ moderatorCommentModal: true })
              moderatorAction(post.author, post.permlink, user.name, 'pending');
            }
            this.setState({ verifyModal: false })
          }}
          onOk={() => {
            moderatorAction(post.author, post.permlink, user.name, 'reviewed').then(() => {
              this.setState({ verifyModal: false })
              this.setState({ commentFormText: 'Thank you for the contribution. It has been approved.' + this.state.commentDefaultFooter })
              this.setState({ moderatorCommentModal: true })
            });
          }}
        >
          <p>By moderating contributions on Utopian <b>you will earn 5% of the total author rewards generated on the platform</b> based on the amount of contributions reviewed.</p>
          <br />
          <ul>
            <li><Icon type="heart" /> This contribution is personal, meaningful and informative.</li>
            <li><Icon type="bulb" /> If it's an idea it is very well detailed and realistic.</li>
            {postType !== 'tutorials' && postType !== 'video-tutorials' ?
              <li><Icon type="smile" /> This is the first and only time this contribution has been shared with the community. </li> : null
            }
            <li><Icon type="search" /> This contribution is verifiable and provides proof of the work.</li>
            <li><Icon type="safety" /> Read all the rules: <Link to="/rules">Read the rules</Link></li>
          </ul>
          <br />
          <p>If this contribution does not meet the Utopian Standards please advise changes to the user using the comments or leave it unverified. Check replies to your comments often to see if the user has submitted the changes you have requested.</p>
          <p><b>Is this contribution ready to be verified? <Link to="/rules">Read the rules</Link></b></p>
        </Modal>

        {/* Moderator Comment Modal - Allows for moderator to publish template-based comment after marking a post as reviewed/flagged/pending */}

        <Modal
          visible={this.state.moderatorCommentModal}
          title='Write a Moderator Comment'
          footer={false}
          // okText='Done' 
          onCancel={() => {
            var mark = "verified";
            if (post.reviewed) {
              mark = "Verified";
            } else if (post.pending) {
              mark = "Pending Review";
            } else if (post.flagged) {
              mark = "Hidden";
            }
            var makesure = window.confirm("Are you sure you want to mark this post as " + mark + " without writing a moderator comment?")
            if (makesure) {
              this.setState({ moderatorCommentModal: false })
              if ((post.pending) || (post.flagged)) {
                history.push("/all/review");
              }
            }
          }}
          onOk={() => {
            this.setState({ moderatorCommentModal: false })
          }}
        >
          <p>Below, you may write a moderation commment for this post. </p><br />
          {post.reviewed ? <p>Since you marked this contribution as <em>verified</em>, you may simply leave the current comment in place.</p> : null}
          {post.pending && this.state.reviewsource < 2 ? <p>Since you marked this contribution as <em>Pending Review</em>, you should detail what changes (if any) the author should make, or why it couldn't be verified in its current form.</p> : null}
          {post.pending && this.state.reviewsource == 2 ? <p>Since you chose to mark this contribution as <em>Pending Review</em> instead, you should detail what changes (if any) the author should make, or why you changed your mind about verifying it.</p> : null}
          {post.pending ?
            <div onChange={this.setModTemplate.bind(this)}>
              <b>Choose a template, or start editing:</b>
              <ul class="list">
                <li class="list__item"><input type="radio" value="pendingDefault" id="pendingDefault" name="modTemplate" checked={this.state.modTemplate === 'pendingDefault'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingDefault") }} for="pendingDefault" class="label">Default</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingWrongRepo" id="pendingWrongRepo" name="modTemplate" checked={this.state.modTemplate === 'pendingWrongRepo'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingWrongRepo") }} for="pendingWrongRepo" class="label">Wrong Repository</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingWrongCategory" id="pendingWrongCategory" name="modTemplate" checked={this.state.modTemplate === 'pendingWrongCategory'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingWrongCategory") }} for="pendingWrongCategory" class="label">Wrong Category</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingWrongRepoSpecified" id="pendingWrongRepoSpecified" name="modTemplate" checked={this.state.modTemplate === 'pendingWrongRepoSpecified'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingWrongRepoSpecified") }} for="pendingWrongRepoSpecified" class="label">Wrong Repository (Specify Correct One)</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingPow" id="pendingPow" name="modTemplate" checked={this.state.modTemplate === 'pendingPow'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingPow") }} for="pendingPow" class="label">Proof of Work Required</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingTooShort" id="pendingTooShort" name="modTemplate" checked={this.state.modTemplate === 'pendingTooShort'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingTooShort") }} for="pendingTooShort" class="label">Too Short</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingNotEnglish" id="pendingNotEnglish" name="modTemplate" checked={this.state.modTemplate === 'pendingNotEnglish'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingNotEnglish") }} for="pendingNotEnglish" class="label">Not in English</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingBadTags" id="pendingBadTags" name="modTemplate" checked={this.state.modTemplate === 'pendingBadTags'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingBadTags") }} for="pendingBadTags" class="label">Irrelevant Tags</label><br /></li>
                <li class="list__item"><input type="radio" value="pendingBanner" id="pendingBanner" name="modTemplate" checked={this.state.modTemplate === 'pendingBanner'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("pendingBanner") }} for="pendingBanner" class="label">Banners Present</label><br /></li>
              </ul>
            </div>
            : null}
          {post.flagged ? <p>Since you marked this contribution as <em>flagged</em>, try explaining why the post could not be accepted. </p> : null}
          {post.flagged ?
            <div onChange={this.setModTemplate.bind(this)}>
              <b>Choose a template, or start editing:</b>
              <ul class="list">
                <li class="list__item"><input type="radio" value="flaggedDefault" id="flaggedDefault" name="modTemplate" checked={this.state.modTemplate === 'flaggedDefault'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedDefault") }} for="flaggedDefault" class="label">Default</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedDuplicate" id="flaggedDuplicate" name="modTemplate" checked={this.state.modTemplate === 'flaggedDuplicate'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedDuplicate") }} for="flaggedDuplicate" class="label">Duplicate Contribution</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedNotOpenSource" id="flaggedNotOpenSource" name="modTemplate" checked={this.state.modTemplate === 'flaggedNotOpenSource'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedNotOpenSource") }} for="flaggedNotOpenSource" class="label">Not Related to Open-Source</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedSpam" id="flaggedSpam" name="modTemplate" checked={this.state.modTemplate === 'flaggedSpam'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedSpam") }} for="flaggedSpam" class="label">Spam</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedPlagiarism" id="flaggedPlagiarism" name="modTemplate" checked={this.state.modTemplate === 'flaggedPlagiarism'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedPlagiarism") }} for="flaggedPlagiarism" class="label">Plagiarism</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedTooShort" id="flaggedTooShort" name="modTemplate" checked={this.state.modTemplate === 'flaggedTooShort'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedTooShort") }} for="flaggedTooShort" class="label">Too Short</label><br /></li>
                <li class="list__item"><input type="radio" value="flaggedNotEnglish" id="flaggedNotEnglish" name="modTemplate" checked={this.state.modTemplate === 'flaggedNotEnglish'} class="radio-btn" /> <label onClick={() => { this.setModTemplateByName("flaggedNotEnglish") }} for="flaggedNotEnglish" class="label">Not in English</label><br /></li>
              </ul>
            </div>
            : null}
          <CommentForm
            intl={intl}
            parentPost={post}
            username={this.props.user.name}
            isLoading={this.state.showCommentFormLoading}
            inputValue={this.state.commentFormText}
            onSubmit={ /* the current onSubmit does not work because "commentsActions.sendComment().then is not a function" */
              (parentPost, commentValue, isUpdating, originalComment) => {
                this.setState({ showCommentFormLoading: true });

                this.props
                  .sendComment(parentPost, commentValue, isUpdating, originalComment)
                  .then(() => {
                    this.setState({
                      showCommentFormLoading: false,
                      moderatorCommentModal: false,
                      commentFormText: '',
                    });
                  })
                  .catch(() => {
                    this.setState({
                      showCommentFormLoading: false,
                      commentFormText: commentValue,
                    });
                  });
                if ((post.pending) || (post.flagged)) {
                  history.push("/all/review");
                }
              }}
            onImageInserted={(blob, callback, errorCallback) => {
              const username = this.props.user.name;

              const formData = new FormData();
              formData.append('files', blob);

              fetch(`https://busy-img.herokuapp.com/@${username}/uploads`, {
                method: 'POST',
                body: formData,
              })
                .then(res => res.json())
                .then(res => callback(res.secure_url, blob.name))
                .catch(() => errorCallback());
            }}
          />
        </Modal>

          </span>
    );
}